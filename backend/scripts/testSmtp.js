require("dotenv").config();

const { sendMail } = require("../services/emailService");

const maskEmail = (email = "") => {
  const [name, domain] = String(email).split("@");

  if (!name || !domain) return "unknown";

  return `${name.slice(0, 2)}***@${domain}`;
};

const run = async () => {

  const recipients =
    process.argv.slice(2).filter(Boolean).length > 0
      ? process.argv.slice(2).filter(Boolean)
      : ["anshulshakya5632@gmail.com"];

  console.log(
    `Resend test starting. Recipients=${recipients
      .map(maskEmail)
      .join(", ")}`
  );

  console.log(
    `Using RESEND_API_KEY=${
      process.env.RESEND_API_KEY
        ? "configured"
        : "missing"
    }`
  );

  for (const to of recipients) {

    console.log(
      `Sending Resend email to ${maskEmail(to)}...`
    );

    const response = await sendMail({

      to,

      subject: "Nayamo Resend Delivery Test",

      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h1>Nayamo Email Test</h1>

          <p>
            Your Resend integration is working successfully.
          </p>
        </div>
      `,

      text:
        "Your Resend integration is working successfully.",
    });

    console.log(
      `Email sent successfully to ${maskEmail(to)}`
    );

    console.log(
      JSON.stringify(response, null, 2)
    );
  }
};

run().catch((error) => {

  console.error(
    "Resend test failed:",
    JSON.stringify(
      {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        response: error.response,
      },
      null,
      2
    )
  );

  process.exit(1);
});