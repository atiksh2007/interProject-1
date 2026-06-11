const nodemailer = require("nodemailer");

const getTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const ensureEmailConfigured = (fallbackLink) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Email service is not configured. Use this link for local testing:");
      console.warn(fallbackLink);
      return false;
    }

    throw new Error("Email service is not configured");
  }

  return true;
};

const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  if (!ensureEmailConfigured(resetLink)) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from,
    to,
    subject: "Reset your HRMS password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Password reset request${name ? ` for ${escapeHtml(name)}` : ""}</h2>
        <p>Use the button below to reset your HRMS password. This link expires in 1 hour.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
