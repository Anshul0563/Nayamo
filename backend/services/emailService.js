const nodemailer = require("nodemailer");
const logger = require("../config/logger");
const { getSmtpConfig, isConfigured } = require("../config/env");

let transporter;
let verifiedAt = 0;

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

  if (!transporter) {
    logger.info("Creating SMTP transporter");
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
      logger: process.env.SMTP_DEBUG === "true",
      debug: process.env.SMTP_DEBUG === "true",
    });
  } else {
    logger.info("Reusing existing SMTP transporter");
  }

  return { smtp, transporter };
};

const verifySmtp = async () => {
  const { transporter: mailer } = getTransporter();
  const now = Date.now();

  if (now - verifiedAt < 5 * 60 * 1000) return;

  logger.info("Starting SMTP transporter.verify()");
  try {
    await mailer.verify();
  } catch (error) {
    logger.error(
      `SMTP transporter.verify() failed: ${JSON.stringify(getErrorDetails(error))}`,
    );
    throw error;
  }
  verifiedAt = now;
  logger.info("SMTP connection verified");
};

const sendMail = async ({ to, subject, html, text, replyTo }) => {
  const { smtp, transporter: mailer } = getTransporter();

  logger.info(`Preparing email to=${maskEmail(to)} subject="${subject}"`);

  // await verifySmtp();

  logger.info(`Calling transporter.sendMail() to=${maskEmail(to)}`);

  try {

    const info = await mailer.sendMail({

      from: `"Nayamo Support" <${smtp.fromEmail}>`,
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

    logger.error(
      `transporter.sendMail() failed: ${JSON.stringify(getErrorDetails(error))}`,
    );

    throw error;
  }
};

module.exports = {
  sendMail,
  verifySmtp,
};
