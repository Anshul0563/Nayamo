const logger = require("../config/logger");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error("Async error:", {
      method: req.method,
      url: req.url,
      error: err.message,
      stack: err.stack,
    });

    // Delegate to error middleware
    next(err);
  });
};

module.exports = asyncHandler;

