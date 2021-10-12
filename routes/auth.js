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
} = require("../controllers/auth");

router.route("/register").post(sanitizeRegisterValues, register);

router.route("/login").post(sanitizeLoginValues, login);

router.route("/forgotpassword").post(sanitizeForgotValues, forgotPassword);

router.route("/passwordreset/:resetToken").put(sanitizeResetValues, resetPassword);

module.exports = router;
