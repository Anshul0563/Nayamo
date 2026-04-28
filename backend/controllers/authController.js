const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

// 🔐 Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// 🔐 Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// Hash token for storage
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Password validation - strong requirements
const isPasswordStrong = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// 🟢 REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (name.trim().length < 2) {
    res.status(400);
    throw new Error("Name must be at least 2 characters");
  }

  if (!isPasswordStrong(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }

  const userExist = await User.findOne({ email: email.toLowerCase() });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    emailVerificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  if (!Array.isArray(user.refreshTokens)) user.refreshTokens = [];
  user.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  logger.info(`User registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
  });
});

// 🔵 LOGIN
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  const isMatch = await user.comparePassword
    ? await user.comparePassword(password)
    : require("bcryptjs").compare(password, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  // Limit stored refresh tokens to 5 per user
  if (!Array.isArray(user.refreshTokens)) user.refreshTokens = [];
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }
  user.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
  });
});

// 🔄 REFRESH TOKEN
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token is required");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      res.status(401);
      throw new Error("Invalid token type");
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User not found or inactive");
    }

    // Verify token exists in user's stored tokens
    const tokenHash = hashToken(refreshToken);
    const tokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
    const tokenExists = tokens.some(
      (t) => t.tokenHash === tokenHash && t.expiresAt > new Date()
    );

    if (!tokenExists) {
      res.status(401);
      throw new Error("Refresh token revoked or expired");
    }

    // Remove old token and issue new one (rotation)
    user.refreshTokens = tokens.filter((t) => t.tokenHash !== tokenHash);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newTokenHash = hashToken(newRefreshToken);

    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }
    user.refreshTokens.push({
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }
});

// 🚪 LOGOUT
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user._id);

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const tokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
    user.refreshTokens = tokens.filter((t) => t.tokenHash !== tokenHash);
    await user.save();
  }

  logger.info(`User logged out: ${user.email}`);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// 🚪 LOGOUT ALL DEVICES
exports.logoutAll = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshTokens = [];
  await user.save();

  logger.info(`User logged out all devices: ${user.email}`);

  res.json({
    success: true,
    message: "Logged out from all devices successfully",
  });
});

// 👤 GET PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshTokens");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
});
