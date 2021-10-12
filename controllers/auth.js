const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");


// @desc    Login user
exports.login = 
  async (req, res, next) => { 
    const { email, password } = req.body;

    try {
      // Check that user exists by email
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorResponse("No account linked with this email!! Please register first to continue", 401));
      }

      // Check that password match
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return next(new ErrorResponse("Invalid password", 401));
      }

      sendToken(user, 200, res);
    } catch (err) {
      next(err);
    }
};

// @desc    Register user
exports.register = async (req, res, next) => {
  const { email, password, phone } = req.body;
  // console.log(req.files.file);

  try {
    const curr = await User.findOne({ email });

    if (curr) {
      return next(new ErrorResponse("Account with this email already exists! Please Login instead to continue", 400));
    }

    await User.create({
      email,
      password,
      phone
    });

    res.status(200).json({ success: true, data: "Account created successfully! Please Login to continue" });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password Initialization
exports.forgotPassword = async (req, res, next) => {
  // Send Email to email provided but first check if user exists
  const { email } = req.body;
  console.log(1);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("No account linked with this email", 404));
    }

    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    console.log(2);

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
      console.log(3);

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (err) {
      console.log(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset User Password
exports.resetPassword = async (req, res, next) => {
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
      return next(new ErrorResponse("Invalid Token", 400));
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
