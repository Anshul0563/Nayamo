const isConfigured = (value) => {
  if (!value) return false;

  const normalized = String(value).trim();
  if (!normalized) return false;

  return !["TBD", "TODO", "CHANGE_ME", "YOUR_SUPPORT_EMAIL_PASSWORD"].includes(
    normalized.toUpperCase()
  );
};

const getSmtpConfig = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
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
      user,
    timeout: Number(process.env.SMTP_TIMEOUT_MS) || 10000,
  };
};

const getEmailProvider = () => {
  const provider = String(process.env.EMAIL_PROVIDER || "smtp")
    .trim()
    .toLowerCase();

  return provider === "resend" ? "resend" : "smtp";
};

const getResendConfig = () => ({
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL,
});

const getDelhiveryToken = () =>
  process.env.DELHIVERY_API_KEY || process.env.DELHIVERY_TOKEN;

const getDelhiveryBaseUrl = () =>
  process.env.DELHIVERY_BASE_URL || "https://track.delhivery.com";

module.exports = {
  getDelhiveryBaseUrl,
  getDelhiveryToken,
  getEmailProvider,
  getResendConfig,
  getSmtpConfig,
  isConfigured,
};
