const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

class AuthService {
  generateTokens(userId) {
    const payload = { id: userId };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const tokenHash = require("crypto")
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Cleanup old tokens
    user.refreshTokens = user.refreshTokens.filter(token => 
      Date.now() < new Date(token.expiresAt).getTime()
    );

    user.refreshTokens.push({
      tokenHash,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
    });

    await user.save();
  }

  async verifyRefreshToken(refreshToken, userId) {
    const tokenHash = require("crypto")
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findById(userId);
    if (!user) return false;

    const token = user.refreshTokens.find(t => t.tokenHash === tokenHash);
    if (!token || Date.now() > new Date(token.expiresAt).getTime()) {
      return false;
    }

    return true;
  }

  async invalidateRefreshTokens(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }
  }
}

module.exports = new AuthService();

