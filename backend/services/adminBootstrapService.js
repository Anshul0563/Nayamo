const User = require("../models/User");
const logger = require("../config/logger");

/**
 * Creates or repairs the administrator configured through environment variables.
 * This is intentionally opt-in: it runs only when BOOTSTRAP_ADMIN_ON_STARTUP=true.
 */
const bootstrapAdminOnStartup = async () => {
  if (process.env.BOOTSTRAP_ADMIN_ON_STARTUP !== "true") return { action: "skipped" };

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "BOOTSTRAP_ADMIN_ON_STARTUP requires ADMIN_EMAIL and ADMIN_PASSWORD",
    );
  }

  const normalizedEmail = email.toLowerCase();
  let admin = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!admin) {
    admin = new User({
      name: process.env.ADMIN_NAME?.trim() || "System Admin",
      email: normalizedEmail,
      password,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
    });
    await admin.save();
    logger.info(`Startup admin bootstrap: created ${normalizedEmail}`);
    return { action: "created", email: normalizedEmail };
  }

  admin.role = "admin";
  admin.isActive = true;
  admin.isEmailVerified = true;

  // Reset only when explicitly enabled, never on ordinary service restarts.
  if (process.env.RESET_ADMIN_PASSWORD_ON_STARTUP === "true") {
    admin.password = password;
  }

  await admin.save();
  logger.info(`Startup admin bootstrap: updated ${normalizedEmail}`);
  return { action: "updated", email: normalizedEmail };
};

module.exports = { bootstrapAdminOnStartup };
