import nodemailer from "nodemailer";

export function createTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com"; // Default to Gmail
  const port = Number(process.env.SMTP_PORT || 587); // Use 587 for Gmail TLS
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP credentials are missing. OTP emails will be logged to console.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail", // Use Gmail service
    auth: { user, pass }
  });
}

export async function sendOtpEmail(to, otp) {
  const transporter = createTransport();
  const from = process.env.SMTP_FROM || `"HD Notes" <${process.env.SMTP_USER}>`;
  const subject = "Your HD Notes OTP Code";
  const html = `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`;

  if (!transporter) {
    console.log(`DEBUG OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({ from, to, subject, html });
}
