const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Start blocking after 5 requests
    message: "Too many login requests from this IP, please try again later",
    headers: true
});

exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 5 requests
    message: "Too many register requests from this IP, please try again later",
    headers: true
});

exports.confirmLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 5 requests
    message: "Too many requests from this IP, please try again later",
    headers: true
});

exports.forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 1 requests
    message: "Too many password resets from this IP, please try again later",
    headers: true
});

exports.resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Start blocking after 1 requests
    message: "Too many password resets from this IP, please try again later",
    headers: true
});