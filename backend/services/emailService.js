const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { getSmtpConfig, isConfigured } = require("../config/env");

let transporter;

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");

  if (!name || !domain) return "unknown";

  return `${name.slice(0, 2)}***@${domain}`;
};

const getErrorDetails = (error) => ({
  message: error.message,
  code: error.code,
  command: error.command,
  response: error.response,
  responseCode: error.responseCode,
});

const getTransporter = () => {
  const smtp = getSmtpConfig();

  logger.info(
    `SMTP config loaded host=${smtp.host || "missing"} port=${smtp.port || "missing"} secure=${smtp.secure} user=${maskEmail(smtp.user)} from=${maskEmail(smtp.fromEmail)} timeout=${smtp.timeout}`,
  );

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

  // Create transporter only once
  if (!transporter) {
    logger.info("Creating SMTP transporter");

    transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",

      port: 587,

      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      requireTLS: true,

      tls: {
        rejectUnauthorized: false,
        servername: "smtpout.secureserver.net",
      },

      connectionTimeout: 120000,
      greetingTimeout: 120000,
      socketTimeout: 120000,

      dnsTimeout: 120000,

      family: 4,

      pool: false,
    });
  } else {
    logger.info("Reusing existing SMTP transporter");
  }

  return { smtp, transporter };
};

const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const { smtp, transporter: mailer } = getTransporter();

  logger.info(`Preparing email to=${maskEmail(to)} subject="${subject}"`);

  logger.info(`Calling transporter.sendMail() to=${maskEmail(to)}`);

  try {
    const info = await mailer.sendMail({
      from: `"Nayamo" <${smtp.fromEmail}>`,

      to,

      subject,

      html,

      text,

      ...(replyTo ? { replyTo } : {}),
    });

    console.log("========== MAIL SENT INFO ==========");
    console.log(JSON.stringify(info, null, 2));
    console.log("====================================");

    logger.info(
      `transporter.sendMail() accepted messageId=${info.messageId || "none"} accepted=${JSON.stringify(info.accepted || [])} rejected=${JSON.stringify(info.rejected || [])} response=${info.response || "none"}`,
    );

    return info;
  } catch (error) {
    console.error("========== SMTP ERROR ==========");
    console.error(JSON.stringify(getErrorDetails(error), null, 2));
    console.error("================================");

    logger.error(
      `transporter.sendMail() failed: ${JSON.stringify(getErrorDetails(error))}`,
    );

    throw error;
  }
};

module.exports = {
  sendMail,
};
