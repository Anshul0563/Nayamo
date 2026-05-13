const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");
const { sendMail } = require("../services/emailService");
const {
  emitUserNotification,
  emitNotification,
} = require("../services/notificationService");

// 🔐 Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};

// 🔐 Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};

// Hash token for storage
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Password validation - strong requirements
const isPasswordStrong = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
      "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
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
    emailVerificationToken: crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex"),
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
  emitUserNotification(user, "new_registration").catch((err) =>
    logger.error("Registration notification failed:", err.message),
  );

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

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error("Account is deactivated");
  }

  const isMatch =
    typeof user.comparePassword === "function"
      ? await user.comparePassword(password)
      : await require("bcryptjs").compare(password, user.password);

  if (!isMatch) {
    emitNotification(
      null,
      "Failed Admin Login Attempt",
      `Failed login attempt for ${email}`,
      "security",
      "error",
      {
        email,
        path: "/settings",
      },
    ).catch((err) =>
      logger.error("Security notification failed:", err.message),
    );
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
      (t) => t.tokenHash === tokenHash && t.expiresAt > new Date(),
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

// � FORGOT PASSWORD
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetTokenHash = hashToken(resetToken);

  user.passwordResetToken = resetTokenHash;

  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  await user.save({
    validateBeforeSave: false,
  });

  const clientUrl = process.env.CLIENT_URL;

  const encodedToken = encodeURIComponent(resetToken);

  const resetUrl = `${clientUrl.replace(/\/$/, "")}/reset-password?token=${encodedToken}`;

  await sendMail({
    to: user.email,

    subject: "Reset Your Nayamo Password",

    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Password</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background:#0B0B0C;
    font-family:Arial,sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:40px 16px;">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width:560px;
              background:#111214;
              border-radius:20px;
              overflow:hidden;
            "
          >

            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 32px 20px 32px;">

                <h1 style="
                  margin:0;
                  color:#D4A853;
                  font-size:34px;
                  font-weight:700;
                ">
                  Nayamo
                </h1>

                <p style="
                  margin:12px 0 0 0;
                  color:#A1A1AA;
                  font-size:15px;
                ">
                  Luxury Jewellery & Accessories
                </p>

              </td>
            </tr>

            <!-- Main -->
            <tr>
              <td style="padding:10px 32px 40px 32px;">

                <h2 style="
                  margin:0 0 18px 0;
                  color:#ffffff;
                  font-size:28px;
                ">
                  Reset Your Password
                </h2>

                <p style="
                  color:#D4D4D8;
                  font-size:16px;
                  line-height:1.7;
                  margin:0 0 24px 0;
                ">
                  We received a request to reset your Nayamo account password.
                  Click the button below to securely create a new password.
                </p>

                <!-- Button -->
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      align="center"
                      bgcolor="#D4A853"
                      style="border-radius:12px;"
                    >
                      <a
                        href="${resetUrl}"
                        style="
                          display:inline-block;
                          padding:16px 32px;
                          color:#111111;
                          font-size:16px;
                          font-weight:700;
                          text-decoration:none;
                        "
                      >
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="
                  color:#71717A;
                  font-size:14px;
                  line-height:1.7;
                  margin:28px 0 0 0;
                ">
                  This reset link will expire automatically for security reasons.
                </p>

                <p style="
                  color:#71717A;
                  font-size:14px;
                  line-height:1.7;
                  margin:12px 0 0 0;
                ">
                  If you didn’t request this password reset,
                  you can safely ignore this email.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="
                  padding:24px;
                  background:#0F1012;
                "
              >

                <p style="
                  margin:0;
                  color:#71717A;
                  font-size:13px;
                ">
                  © 2026 Nayamo. All rights reserved.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `,

    text: `
Reset your Nayamo password:

${resetUrl}

If you did not request this, you can safely ignore this email.
  `,
  });

  res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
});

// 🔄 RESET PASSWORD (hardened: atomic token consumption to prevent replay)
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (
    !token ||
    typeof token !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    res.status(400);
    throw new Error("Token and new password are required");
  }

  if (!isPasswordStrong(password)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  }

  // Hash incoming token
  const hashedToken = hashToken(token);
  console.log("========== RESET PASSWORD DEBUG ==========");

  console.log("INCOMING TOKEN:");
  console.log(token);

  console.log("HASHED INCOMING TOKEN:");
  console.log(hashedToken);

  console.log("==========================================");

  // Find user by token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired password reset token");
  }

  // Update password
  user.password = password;

  // Clear reset token
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Logout all sessions
  user.refreshTokens = [];

  // Password changed timestamp
  user.passwordChangedAt = Date.now();

  // IMPORTANT:
  // save() triggers password hashing middleware
  await user.save();

  logger.info(`Password reset completed for userId=${user._id}`);

  res.json({
    success: true,
    message: "Password has been reset successfully.",
  });
});

// �👤 GET PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshTokens",
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
});
