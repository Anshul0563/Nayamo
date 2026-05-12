const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { getSmtpConfig, isConfigured } = require("../config/env");

let transporter;
let verifiedAt = 0;

const getTransporter = () => {
  const smtp = getSmtpConfig();

  if (
    !isConfigured(smtp.host) ||
    !isConfigured(smtp.port) ||
    !isConfigured(smtp.user) ||
    !isConfigured(smtp.pass) ||
    !isConfigured(smtp.fromEmail)
  ) {
    const error = new Error("SMTP credentials are not configured");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      connectionTimeout: smtp.timeout,
      greetingTimeout: smtp.timeout,
      socketTimeout: smtp.timeout,
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
    });
  }

  return { smtp, transporter };
};

const verifySmtp = async () => {
  const { transporter: mailer } = getTransporter();
  const now = Date.now();

  if (now - verifiedAt < 5 * 60 * 1000) return;

  await mailer.verify();
  verifiedAt = now;
  logger.info("SMTP connection verified");
};

const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const { smtp, transporter: mailer } = getTransporter();

  await verifySmtp();

  return mailer.sendMail({
    from: `"Nayamo Support" <${smtp.fromEmail}>`,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
};

module.exports = {
  sendMail,
  verifySmtp,
};
