class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Handle common error patterns
  const errorMessages = {
    "Book does not exist": 404,
    "User does not exist": 404,
    "Book already borrowed": 400,
    "Book not borrowed yet": 400,
    "You did not borrow this book": 403,
    "No borrow record found for this book and user": 404,
  };

  const status = errorMessages[err.message];
  if (status) {
    return res.status(status).json({ message: err.message });
  }

  // Unknown errors - don't expose details
  res.status(500).json({ message: "Something went wrong!" });
};

module.exports = { errorHandler, AppError };
