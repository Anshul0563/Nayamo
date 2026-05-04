const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new Error(message);
    res.status(404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new Error(message);
    res.status(400);
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    error = new Error(message);
    res.status(400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new Error("Invalid token");
    res.status(401);
  }
  if (err.name === "TokenExpiredError") {
    error = new Error("Token expired");
    res.status(401);
  }

  res.status(error.statusCode || res.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

  logger.error(`${err.message} - ${req.method} ${req.url} - ${req.ip}`);
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

module.exports = { errorHandler, notFound };

