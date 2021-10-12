const {check, validationResult} = require('express-validator');

exports.sanitizeLoginValues = [
    check('email')
        .isEmail()
        .trim()
        .normalizeEmail()
        .not()
        .isEmpty()
        // .withMessage('Invalid email address!')
        .bail(),
    check('password')
        .isLength({ min: 6 })
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
        next();
    },
];

exports.sanitizeRegisterValues = [
    check('email')
        .isEmail()
        .trim()
        .normalizeEmail()
        .not()
        .isEmpty()
        .bail(),
    check('password')
        .isLength({ min: 6 })
        .not()
        .isEmpty()
        .trim()
        .escape(),
    check('phone')
        .trim()
        .not()
        .isEmpty()
        .bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
        next();
    },
];

exports.sanitizeForgotValues = [
    check('email')
        .isEmail()
        .trim()
        .normalizeEmail()
        .not()
        .isEmpty()
        .bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
        next();
    },
];

exports.sanitizeResetValues = [
    check('password')
        .isLength({ min: 6 })
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        return res.status(422).json({errors: errors.array()});
        next();
    },
];