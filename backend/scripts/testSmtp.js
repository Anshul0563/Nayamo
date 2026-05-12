const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { sendMail, verifySmtp } = require("../services/emailService");

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "unknown";
  return `${name.slice(0, 2)}***@${domain}`;
};

const run = async () => {
  const to =
    process.argv[2] ||
    process.env.SMTP_TEST_TO ||
    process.env.CONTACT_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;

  if (!to) {
    throw new Error("No test recipient. Pass one as an argument or set SMTP_TEST_TO.");
  }

  console.log(`SMTP test starting. Recipient=${maskEmail(to)}`);
  console.log(
    `SMTP env host=${process.env.SMTP_HOST || "missing"} port=${process.env.SMTP_PORT || "missing"} secure=${process.env.SMTP_SECURE || "missing"} user=${maskEmail(process.env.SMTP_USER || process.env.EMAIL_USER)} from=${maskEmail(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER)}`,
  );

  console.log("Running transporter.verify()...");
  await verifySmtp();
  console.log("transporter.verify() succeeded.");

  console.log("Running transporter.sendMail()...");
  const info = await sendMail({
    to,
    subject: "Nayamo SMTP delivery test",
    html: "<p>This is a Nayamo SMTP delivery test.</p>",
    text: "This is a Nayamo SMTP delivery test.",
  });

  console.log("sendMail succeeded.");
  console.log(
    JSON.stringify(
      {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      },
      null,
      2,
    ),
  );
};

run().catch((error) => {
  console.error(
    "SMTP test failed:",
    JSON.stringify(
      {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
