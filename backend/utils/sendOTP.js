import nodemailer from "nodemailer";

const { OTP_EMAIL, OTP_EMAIL_PASS } = process.env;

if (!OTP_EMAIL || !OTP_EMAIL_PASS) {
  console.warn(
    "Gmail SMTP is not configured. Set OTP_EMAIL and OTP_EMAIL_PASS."
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: OTP_EMAIL,
    pass: OTP_EMAIL_PASS,
  },
});

export const sendOtp = async (email, otp) => {
  if (!OTP_EMAIL || !OTP_EMAIL_PASS) {
    return;
  }

  await transporter.sendMail({
    from: `"CR Matrix" <${OTP_EMAIL}>`,
    to: email,
    subject: "Your CR Matrix OTP Code",
    text: `Your OTP code is ${otp}.

This code expires in 5 minutes.

If you did not request this code, you can safely ignore this email.`,
  });
};
