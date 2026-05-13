const { Resend } = require("resend");
const logger = require("../config/logger");

const resend = new Resend(process.env.RESEND_API_KEY);

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");

  if (!name || !domain) return "unknown";

  return `${name.slice(0, 2)}***@${domain}`;
};

const getErrorDetails = (error) => ({
  message: error.message,
  name: error.name,
  statusCode: error.statusCode,
  response: error.response,
});

const verifySmtp = async () => {
  if (!process.env.RESEND_API_KEY) {
    const error = new Error("RESEND_API_KEY is missing");
    error.code = "RESEND_NOT_CONFIGURED";
    throw error;
  }

  logger.info("Resend configuration verified");
};

const sendMail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
}) => {

  logger.info(
    `Preparing Resend email to=${maskEmail(to)} subject="${subject}"`
  );

  await verifySmtp();

  try {

    const response = await resend.emails.send({

      from: "Nayamo <support@nayamo.in>",

      to: Array.isArray(to) ? to : [to],

      subject,

      html,

      text,

      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    console.log("========== RESEND MAIL INFO ==========");
    console.log(JSON.stringify(response, null, 2));
    console.log("======================================");

    logger.info(
      `Resend email sent successfully id=${response?.data?.id || "unknown"}`
    );

    return response;

  } catch (error) {

    logger.error(
      `Resend email failed: ${JSON.stringify(
        getErrorDetails(error)
      )}`
    );

    throw error;
  }
};

module.exports = {
  sendMail,
  verifySmtp,
};