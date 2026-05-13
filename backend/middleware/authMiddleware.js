const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */
const protect = async (req, res, next) => {
  try {
    // Validate JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const authHeader = req.headers.authorization;
    logger.info("[authMiddleware] Authorization header:", authHeader);
    logger.info("[authMiddleware] Incoming headers:", {
      authorization: authHeader,
      origin: req.headers.origin,
      referer: req.headers.referer,
    });

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info("[authMiddleware] Decoded token (safe):", {
      type: decoded?.type,
      id: decoded?.id,
      iat: decoded?.iat,
      exp: decoded?.exp,
    });

    // Ensure this is an access token, not a refresh token
    if (decoded.type !== "access") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type. Use an access token.",
      });
    }

    // Fetch user from database (excludes password and refresh tokens)
    const user = await User.findById(decoded.id).select("-password -refreshTokens");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or token is invalid",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({
        success: false,
        message: "Password recently changed. Please login again.",
      });
    }

    // Attach user to request
    req.user = user;
    logger.info("[authMiddleware] req.user:", { id: req.user?._id, email: req.user?.email, role: req.user?.role });
    next();

  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    logger.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

module.exports = protect;
