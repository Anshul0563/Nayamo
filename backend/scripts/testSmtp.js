const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { sendMail, verifySmtp } = require("../services/emailService");

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");
  if (!name || !domain) return "unknown";
  return `${name.slice(0, 2)}***@${domain}`;
};

const run = async () => {
  const recipients =
    process.argv.slice(2).filter(Boolean).length > 0
      ? process.argv.slice(2).filter(Boolean)
      : [
          process.env.SMTP_TEST_TO ||
            process.env.CONTACT_EMAIL ||
            process.env.SMTP_USER ||
            process.env.EMAIL_USER,
        ].filter(Boolean);

  if (recipients.length === 0) {
    throw new Error("No test recipient. Pass one or more addresses as arguments or set SMTP_TEST_TO.");
  }

  console.log(`SMTP test starting. Recipients=${recipients.map(maskEmail).join(", ")}`);
  console.log(
    `SMTP env host=${process.env.SMTP_HOST || "missing"} port=${process.env.SMTP_PORT || "missing"} secure=${process.env.SMTP_SECURE || "missing"} user=${maskEmail(process.env.SMTP_USER || process.env.EMAIL_USER)} from=${maskEmail(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER)}`,
  );

  console.log("Running transporter.verify()...");
  await verifySmtp();
  console.log("transporter.verify() succeeded.");

  for (const to of recipients) {
    console.log(`Running transporter.sendMail() to ${maskEmail(to)}...`);
    const info = await sendMail({
      to,
      subject: "Nayamo SMTP delivery test",
      html: "<p>This is a Nayamo SMTP delivery test.</p>",
      text: "This is a Nayamo SMTP delivery test.",
    });

    console.log(`sendMail succeeded for ${maskEmail(to)}.`);
    console.log(
      JSON.stringify(
        {
          to: maskEmail(to),
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
        },
        null,
        2,
      ),
    );
  }
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
