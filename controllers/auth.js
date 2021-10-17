const crypto = require("crypto");
const axios = require('axios')
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

async function validateHuman(token) {
  const secret = process.env.RECAPTCHA_SECRET;
  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
  );
  return res.data.success;
}

// @desc    Login user
exports.login = 
  async (req, res, next) => { 
    const { 
      email, 
      password, 
      captchaToken 
    } = req.body;

    const human = await validateHuman(captchaToken);

    if(!human) {
      return res.status(400).send('Suspected Bot!');
    }

    try {
      // Check that user exists by email
      const user = await User.findOne({ email }).select("+password");
      let isMatch = false;

      // Check that password match
      if(user) {
        isMatch = await user.matchPassword(password);
      }

      if (user && isMatch) {
        sendToken(user, 200, res);
      }
      else {
        res.status(400).send('Login failed! Invalid credentials');
      }

    } catch (err) {
      next(err);
    }
};

// @desc    Register user
exports.register = async (req, res, next) => {
  const { 
    email, 
    password, 
    phone,
    captchaToken 
  } = req.body;
  
  const human = await validateHuman(captchaToken);

  if(!human) {
    return res.status(400).send('Suspected Bot!');
  }

  try {
    const curr = await User.findOne({ email });

    if(!curr) {
      await User.create({
        email,
        password,
        phone
      });
    }

    if(curr) {
      return res.status(400).send('Registration failed');
    }
    else {
      res.status(201).json({ success: true, data: "Account created successfully! Please Login to continue" });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password Initialization
exports.forgotPassword = async (req, res, next) => {
  // Send Email to email provided but first check if user exists
  const { 
    email,
    captchaToken
  } = req.body;
  
  const human = await validateHuman(captchaToken);

  if(!human) {
    return res.status(400).send('Suspected Bot!');
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Password reset failed');
    }

    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset url to email to provided email
    const resetUrl = `http://localhost:3000/authLevel1/passwordreset/${resetToken}`;

    // HTML Message
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a put request to the following link:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(500).json('Email could not be sen\'t');
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset User Password
exports.resetPassword = async (req, res, next) => {

  const human = await validateHuman(req.body.captchaToken);

  if(!human) {
    return res.status(400).send('Suspected Bot!');
  }

  // Compare token in URL params to hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Password reset failed');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Updated Success",
      token: user.getSignedJwtToken(),
    });
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ sucess: true, token });
};
