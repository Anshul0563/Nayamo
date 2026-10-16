const isConfigured = (value) => {
  if (!value) return false;

  const normalized = String(value).trim();
  if (!normalized) return false;

  const upper = normalized.toUpperCase();
  return !["TBD", "TODO", "CHANGE_ME", "YOUR_SUPPORT_EMAIL_PASSWORD"].includes(upper) &&
    !upper.includes("REPLACE_WITH") && !upper.includes("YOUR_") && !upper.includes("YOUR ") && !upper.includes("EXAMPLE.COM");
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

const getShiprocketEmail = () => process.env.SHIPROCKET_EMAIL;
const getShiprocketPassword = () => process.env.SHIPROCKET_PASSWORD;
const getShiprocketBaseUrl = () =>
  process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in/v1/external";
const getShiprocketPickupLocation = () => process.env.SHIPROCKET_PICKUP_LOCATION;
const getShiprocketPickupPincode = () => process.env.SHIPROCKET_PICKUP_PINCODE;
const getShiprocketWebhookToken = () => process.env.SHIPROCKET_WEBHOOK_TOKEN;
const getShiprocketReturnSeller = () => ({
  name: process.env.SHIPROCKET_RETURN_SELLER_NAME,
  address: process.env.SHIPROCKET_RETURN_SELLER_ADDRESS,
  city: process.env.SHIPROCKET_RETURN_SELLER_CITY,
  state: process.env.SHIPROCKET_RETURN_SELLER_STATE,
  pincode: process.env.SHIPROCKET_RETURN_SELLER_PINCODE,
  country: process.env.SHIPROCKET_RETURN_SELLER_COUNTRY || "India",
  phone: process.env.SHIPROCKET_RETURN_SELLER_PHONE,
  email: process.env.SHIPROCKET_RETURN_SELLER_EMAIL,
});

module.exports = {
  getDelhiveryBaseUrl,
  getDelhiveryToken,
  getShiprocketEmail,
  getShiprocketPassword,
  getShiprocketBaseUrl,
  getShiprocketPickupLocation,
  getShiprocketPickupPincode,
  getShiprocketWebhookToken,
  getShiprocketReturnSeller,
  getEmailProvider,
  getResendConfig,
  getSmtpConfig,
  isConfigured,
};
