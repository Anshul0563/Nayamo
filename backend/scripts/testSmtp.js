const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { sendMail} = require("../services/emailService");

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
    throw new Error(
      "No test recipient. Pass one or more addresses as arguments or set SMTP_TEST_TO."
    );
  }

  console.log(
    `SMTP test starting. Recipients=${recipients
      .map(maskEmail)
      .join(", ")}`
  );

  console.log(
    `SMTP env host=${process.env.SMTP_HOST || "missing"} port=${process.env.SMTP_PORT || "missing"} secure=${process.env.SMTP_SECURE || "missing"} user=${maskEmail(process.env.SMTP_USER || process.env.EMAIL_USER)} from=${maskEmail(process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER)}`
  );

  
  for (const to of recipients) {

    console.log(
      `Running transporter.sendMail() to ${maskEmail(to)}...`
    );

    // Fake reset token for testing
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Frontend reset password page URL
    const resetUrl =
      `https://nayamo.in/reset-password?token=${resetToken}`;

    const info = await sendMail({

      to,

      subject: "Reset Your Nayamo Password",

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">

          <h2 style="margin-bottom: 16px;">
            Reset Your Password
          </h2>

          <p style="margin-bottom: 20px;">
            We received a request to reset your Nayamo account password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              background:#111;
              color:#fff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 24px; font-size: 14px; color: #666;">
            If you did not request this password reset,
            you can safely ignore this email.
          </p>

          <p style="margin-top: 12px; font-size: 13px; color: #888;">
            This link will expire automatically.
          </p>

        </div>
      `,

      text: `
Reset your Nayamo password:

${resetUrl}

If you did not request this, ignore this email.
      `,
    });

    console.log(
      `sendMail succeeded for ${maskEmail(to)}.`
    );

    console.log(
      JSON.stringify(
        {
          to: maskEmail(to),
          resetUrl,
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
        },
        null,
        2
      )
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
      2
    )
  );

  process.exit(1);
});