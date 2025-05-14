const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validator for send OTP API
const sendOtpValidator = [
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  validate
];

// Validator for registration API
const registerValidator = [
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('any').withMessage('Invalid phone number format'),
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Invalid date format'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits'),
  validate
];

// Validator for save score API
const saveScoreValidator = [
  body('score')
    .notEmpty().withMessage('Score is required')
    .isInt({ min: 50, max: 500 }).withMessage('Score must be between 50 and 500'),
  validate
];

module.exports = {
  sendOtpValidator,
  registerValidator,
  saveScoreValidator
}; 