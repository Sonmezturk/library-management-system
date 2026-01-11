const { body, param } = require("express-validator");
const { handleValidationErrors } = require("./users.validator");

const bookValidator = [
  body("name").notEmpty().withMessage("Title is required"),
  handleValidationErrors,
];

const idValidator = [
  param("id").notEmpty().isInt({ min: 1 }).withMessage("Valid ID is required"),
  handleValidationErrors,
];

module.exports = { bookValidator, idValidator };
