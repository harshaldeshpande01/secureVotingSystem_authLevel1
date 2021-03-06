const express = require("express");
const router = express.Router();

// Sanitizers
const { 
  sanitizeLoginValues,
  sanitizeRegisterValues,
  sanitizeForgotValues,
  sanitizeResetValues
} = require('../middleware/sanitizers')

// Controllers
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  confirmEmail,
} = require("../controllers/auth");

// Rate limiters
const {
  loginLimiter,
  registerLimiter,
  confirmLimiter,
  forgotLimiter,
  resetLimiter
} = require('../middleware/rate_limiters');

router.route("/register").post(registerLimiter, sanitizeRegisterValues, register);

router.route("/confirmation/:token").put(confirmLimiter, confirmEmail);

router.route("/login").post(loginLimiter, sanitizeLoginValues, login);

router.route("/forgotpassword").post(forgotLimiter, sanitizeForgotValues, forgotPassword);

router.route("/passwordreset/:resetToken").put(resetLimiter, sanitizeResetValues, resetPassword);

module.exports = router;
