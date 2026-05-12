const isConfigured = (value) => {
  if (!value) return false;

  const normalized = String(value).trim();
  if (!normalized) return false;

  return !["TBD", "TODO", "CHANGE_ME", "YOUR_SUPPORT_EMAIL_PASSWORD"].includes(
    normalized.toUpperCase()
  );
};

const getSmtpConfig = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host: process.env.SMTP_HOST,
    port,
    secure:
      process.env.SMTP_SECURE === "true" ||
      (process.env.SMTP_SECURE !== "false" && port === 465),
    user,
    pass,
    fromEmail:
      process.env.SMTP_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      user ||
      process.env.EMAIL_USER,
    timeout: Number(process.env.SMTP_TIMEOUT_MS) || 10000,
  };
};

const getDelhiveryToken = () =>
  process.env.DELHIVERY_API_KEY || process.env.DELHIVERY_TOKEN;

const getDelhiveryBaseUrl = () =>
  process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";

module.exports = {
  getDelhiveryBaseUrl,
  getDelhiveryToken,
  getSmtpConfig,
  isConfigured,
};
