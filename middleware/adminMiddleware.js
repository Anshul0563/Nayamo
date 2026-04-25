/**
 * Admin Authorization Middleware
 * Must be used AFTER protect middleware (defense in depth)
 */
const admin = (req, res, next) => {
  // Defense in depth: ensure user exists (protect should run first)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required",
    });
  }

  next();
};

module.exports = admin;
