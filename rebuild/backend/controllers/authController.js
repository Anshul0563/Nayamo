const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const authService = require("../services/authService");
const { body } = require("express-validator");
const logger = require("../config/logger");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const user = await User.create({ name, email, password });

  const tokens = authService.generateTokens(user._id);
  await authService.saveRefreshToken(user._id, tokens.refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered",
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account disabled",
    });
  }

  const tokens = authService.generateTokens(user._id);
  await authService.saveRefreshToken(user._id, tokens.refreshToken);

  res.json({
    success: true,
    data: {
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.invalidateRefreshTokens(req.user._id);
  res.json({ success: true, message: "Logged out" });
});

exports.profile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user._id);

  if (!await authService.verifyRefreshToken(refreshToken, user._id)) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const tokens = authService.generateTokens(user._id);
  await authService.saveRefreshToken(user._id, tokens.refreshToken);

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

