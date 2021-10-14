const {check, validationResult} = require('express-validator');

exports.sanitizeLoginValues = [
    check('email')
        .isEmail()
        .trim()
        .normalizeEmail()
        .not()
        .isEmpty()
        .bail(),
    check('password')
        .isLength({ min: 6 })
        .isLength({ max: 64 })
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send('Invalid input');
        }
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
        .isLength({ max: 64 })
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
        if (!errors.isEmpty()) {
            return res.status(422).send('Invalid input!');
        }
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
        if (!errors.isEmpty()) {
            return res.status(422).send('Invalid input');
        }
        next();
    },
];

exports.sanitizeResetValues = [
    check('password')
        .isLength({ min: 6 })
        .isLength({ max: 64 })
        .not()
        .isEmpty()
        .trim()
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).send('Invalid input');
        }
        next();
    },
];