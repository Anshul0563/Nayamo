const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token, authorization denied ❌"
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ ENV secret use karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ user fetch
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found ❌"
      });
    }

    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed ❌"
    });
  }
};

module.exports = protect;