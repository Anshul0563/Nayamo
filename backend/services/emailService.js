const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const {
  getEmailProvider,
  getResendConfig,
  getSmtpConfig,
  isConfigured,
} = require("../config/env");

let smtpTransporter;
let smtpVerified = false;
let ResendClient;
let resendClient;

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");

  if (!name || !domain) return "unknown";

  return `${name.slice(0, 2)}***@${domain}`;
};

const classifyEmailError = (error) => {
  const message = String(error?.message || "");
  const response = String(error?.response || "");
  const combined = `${message} ${response}`.toLowerCase();

  if (error?.code === "EAUTH" || combined.includes("auth")) {
    return "INVALID_SMTP_CREDENTIALS";
  }

  if (
    error?.code === "ECONNECTION" ||
    error?.code === "ESOCKET" ||
    combined.includes("econnreset")
  ) {
    return "SMTP_CONNECTION_FAILED";
  }
  if (error?.code === "ETIMEDOUT" || combined.includes("timeout")) {
    return "SMTP_TIMEOUT";
  }

  if (
    combined.includes("domain") ||
    combined.includes("sender") ||
    combined.includes("verified")
  ) {
    return "SENDER_OR_DOMAIN_NOT_VERIFIED";
  }

  if (
    error?.code === "SMTP_NOT_CONFIGURED" ||
    error?.code === "RESEND_NOT_CONFIGURED"
  ) {
    return "MISSING_EMAIL_ENV";
  }

  return "EMAIL_SEND_FAILED";
};

const getSafeErrorDetails = (error) => ({
  reason: classifyEmailError(error),
  message: error?.message,
  code: error?.code,
  command: error?.command,
  responseCode: error?.responseCode,
});

const validateSmtpConfig = (smtp) => {
  const missing = [];

  if (!isConfigured(smtp.host)) missing.push("SMTP_HOST");
  if (!isConfigured(smtp.port)) missing.push("SMTP_PORT");
  if (!isConfigured(smtp.user)) missing.push("SMTP_USER");
  if (!isConfigured(smtp.pass)) missing.push("SMTP_PASS");
  if (!isConfigured(smtp.fromEmail)) missing.push("SMTP_FROM_EMAIL");

  if (missing.length) {
    const error = new Error(`Missing email environment variables: ${missing.join(", ")}`);
    error.code = "SMTP_NOT_CONFIGURED";
    error.missing = missing;
    throw error;
  }
};

const getSmtpTransporter = () => {
  const smtp = getSmtpConfig();

  logger.info(
    `Email provider=smtp host=${smtp.host || "missing"} port=${smtp.port || "missing"} secure=${smtp.secure} user=${maskEmail(smtp.user)} from=${maskEmail(smtp.fromEmail)} timeout=${smtp.timeout}`,
  );

  validateSmtpConfig(smtp);

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      name: process.env.SMTP_HELO_NAME || "nayamo.in",
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      requireTLS: !smtp.secure,
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "true",
        servername: smtp.host,
      },
      connectionTimeout: smtp.timeout,
      greetingTimeout: smtp.timeout,
      socketTimeout: smtp.timeout,
      family: 4,
      pool: false,
    });
  }

  return { smtp, transporter: smtpTransporter };
};

const getResendClient = () => {
  const resend = getResendConfig();

  logger.info(`Email provider=resend from=${maskEmail(resend.fromEmail)}`);

  if (!isConfigured(resend.apiKey) || !isConfigured(resend.fromEmail)) {
    const error = new Error("Missing Resend environment variables");
    error.code = "RESEND_NOT_CONFIGURED";
    throw error;
  }

  if (!ResendClient) {
    try {
      ({ Resend: ResendClient } = require("resend"));
    } catch (_error) {
      const error = new Error("Resend package is not installed for the backend");
      error.code = "RESEND_PACKAGE_MISSING";
      throw error;
    }
  }

  if (!resendClient) {
    resendClient = new ResendClient(resend.apiKey);
  }

  return { resend, client: resendClient };
};

const sendSmtpMail = async ({ to, subject, html, text, replyTo }) => {
  const { smtp, transporter } = getSmtpTransporter();

  logger.info(`Sending SMTP email to=${maskEmail(to)} subject="${subject}"`);

  if (!smtpVerified) {
    await transporter.verify();
    smtpVerified = true;
    logger.info(
      `SMTP transport verified host=${smtp.host} port=${smtp.port} secure=${smtp.secure} user=${maskEmail(smtp.user)} from=${maskEmail(smtp.fromEmail)}`,
    );
  }

  const info = await transporter.sendMail({
    from: `"Nayamo" <${smtp.fromEmail}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  logger.info(
    `SMTP email sent to=${maskEmail(to)} messageId=${info.messageId || "none"} accepted=${(info.accepted || []).length} rejected=${(info.rejected || []).length}`,
  );

  return info;
};

const sendResendMail = async ({ to, subject, html, text, replyTo }) => {
  const { resend, client } = getResendClient();

  logger.info(`Sending Resend email to=${maskEmail(to)} subject="${subject}"`);

  const result = await client.emails.send({
    from: `"Nayamo" <${resend.fromEmail}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });

  if (result?.error) {
    const error = new Error(result.error.message || "Resend email failed");
    error.code = result.error.name || "RESEND_SEND_FAILED";
    throw error;
  }

  logger.info(`Resend email sent to=${maskEmail(to)} messageId=${result?.data?.id || "none"}`);

  return result?.data || result;
};

const sendMail = async (mail) => {
  const provider = getEmailProvider();

  try {
    return provider === "resend" ? await sendResendMail(mail) : await sendSmtpMail(mail);
  } catch (error) {
    logger.error(
      `Email send failed provider=${provider} to=${maskEmail(mail?.to)} details=${JSON.stringify(getSafeErrorDetails(error))}`,
    );

    throw error;
  }
};

const verifyEmailTransport = async () => {
  const provider = getEmailProvider();

  if (provider === "resend") {
    const { resend } = getResendClient();
    return {
      provider,
      configured: true,
      from: maskEmail(resend.fromEmail),
    };
  }

  const { smtp, transporter } = getSmtpTransporter();
  await transporter.verify();
  smtpVerified = true;

  logger.info(
    `SMTP transport verified host=${smtp.host} port=${smtp.port} secure=${smtp.secure} user=${maskEmail(smtp.user)} from=${maskEmail(smtp.fromEmail)}`,
  );

  return {
    provider,
    configured: true,
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    user: maskEmail(smtp.user),
    from: maskEmail(smtp.fromEmail),
  };
};

module.exports = {
  classifyEmailError,
  getSafeErrorDetails,
  sendMail,
  verifyEmailTransport,
};
