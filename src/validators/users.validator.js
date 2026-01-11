const { body, param, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  handleValidationErrors,
];

const borrowValidator = [
  param("id").notEmpty().isInt({ min: 1 }).withMessage("Valid user ID is required"),
  param("bookId").notEmpty().isInt({ min: 1 }).withMessage("Valid book ID is required"),
  handleValidationErrors,
];

const returnValidator = [
  param("id").notEmpty().isInt({ min: 1 }).withMessage("Valid user ID is required"),
  param("bookId").notEmpty().isInt({ min: 1 }).withMessage("Valid book ID is required"),
  body("score")
    .notEmpty()
    .isInt({ min: 1, max: 10 })
    .withMessage("Score must be between 1 and 10"),
  handleValidationErrors,
];

const idValidator = [
  param("id").notEmpty().isInt({ min: 1 }).withMessage("Valid ID is required"),
  handleValidationErrors,
];

module.exports = {
  userValidator,
  borrowValidator,
  returnValidator,
  idValidator,
  handleValidationErrors,
};
