const asyncHandler = require("../utils/asyncHandler");
const nodemailer = require("nodemailer");
const logger = require("../config/logger");

exports.sendMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Create test transporter (production: use SMTP)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Nayamo Contact" <${process.env.SMTP_USER}>`,
    to: "support@nayamo.com", // Or dynamic admin email
    replyTo: email,
    subject: `New Contact from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  await transporter.sendMail(mailOptions);

  res.json({
    success: true,
    message: "Message sent successfully",
  });
});

