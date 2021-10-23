const axios = require('axios')
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

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

      if(!user.confirmed)
        return res.status(400).send('Invalid credentials');

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

  const curr = await User.findOne({ email });

  if(!curr) {
    await User.create({
      confirmed: false,
      email,
      password,
      phone
    });

    // async email
    jwt.sign(
      {
        email
      },
      process.env.EMAIL_VERIFY_SECRET,
      {
        expiresIn: '1d',
      },
      (err, emailToken) => {
        const url = `http://localhost:3000/authLevel1/confirmation/${emailToken}`;
        const message = `
          <p>Please follow this link to confirm your email</p>
          <a href=${url} clicktracking=off>${url}</a>
        `;

        sendEmail({
          to: email,
          subject: 'Confirm Email',
          text: message
        });
      },
    );
  }

  if(!curr)
    res.status(200).json({data: 'Confirmation email has been sen\'t to your email. Please check your inbox'});
  else 
    res.status(400).send('Registation failed!');

};


// @desc    Reset User Password
exports.confirmEmail = async (req, res, next) => {

  const human = await validateHuman(req.body.captchaToken);

  if(!human) {
    return res.status(400).send('Suspected Bot!');
  }

  const token = req.params.token;

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET);
    if(decoded && decoded.email) {
      const email = decoded.email;
      const user = await User.findOne({email});
      user.confirmed = true;
      await user.save();

      res.status(200).json({
        success: true,
        data: "Email verified. You can now access your account by logging in!",
      });
    }
  } catch (err) {
    next(res.status(400).send('Invalid token'));
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

    // async email
    jwt.sign(
      {
        email
      },
      process.env.RESET_SECRET,
      {
        expiresIn: '1d',
      },
      (err, resetToken) => {
        const url = `http://localhost:3000/authLevel1/passwordreset/${resetToken}`;
        const message = `
          <h1>You have requested a password reset</h1>
          <p>Please make a put request to the following link:</p>
          <a href=${url} clicktracking=off>${url}</a>
        `;

        sendEmail({
          to: email,
          subject: 'You requested a password reset',
          text: message
        });
      },
    );

    res.status(200).json({data: "Password reset request has been initiated. Please check your inbox"});

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

  const resetPasswordToken = req.params.resetToken;

  try {
    const decoded = jwt.verify(resetPasswordToken, process.env.RESET_SECRET);
    if(decoded && decoded.email) {
      const email = decoded.email;
      const user = await User.findOne({email});
      user.password = req.body.password;
      await user.save();

      res.status(200).json({
        success: true,
        data: "Password Updated Success",
      });
    }
  } catch (err) {
    next(res.status(400).send('Invalid token'));
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({ sucess: true, token });
};
