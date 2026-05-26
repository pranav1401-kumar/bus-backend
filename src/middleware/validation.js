const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const bookTicketValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors,
];

const updateTicketValidation = [
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('status').optional().isIn(['open', 'closed']).withMessage('Status must be open or closed'),
  handleValidationErrors,
];

module.exports = { bookTicketValidation, updateTicketValidation, handleValidationErrors };
