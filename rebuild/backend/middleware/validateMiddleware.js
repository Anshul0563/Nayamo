const asyncHandler = require("../utils/asyncHandler");
const { validationResult } = require("express-validator");
const logger = require("../config/logger");

const validate = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    logger.warn("Validation failed:", errorMessages);

    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  } else {
    next();
  }
});

module.exports = validate;

