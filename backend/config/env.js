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

  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    fromEmail: user || process.env.EMAIL_USER,
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
