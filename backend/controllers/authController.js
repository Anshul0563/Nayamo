const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");

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
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Password validation - strong requirements
const isPasswordStrong = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// 🟢 REGISTER
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
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

  // Check user exists
  const userExist = await User.findOne({ email: email.toLowerCase() });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    emailVerificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

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

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // Find user (include password for comparison)
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

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
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== "refresh") {
      res.status(401);
      throw new Error("Invalid token type");
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User not found or inactive");
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

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

// 👤 GET PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
});
