import nodemailer from "nodemailer";

const { OTP_EMAIL, OTP_EMAIL_PASS } = process.env;

if (!OTP_EMAIL || !OTP_EMAIL_PASS) {
  console.warn(
    "⚠️ Gmail SMTP is not configured. Set OTP_EMAIL and OTP_EMAIL_PASS in your environment variables."
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
    console.error("❌ Cannot send OTP: SMTP configuration is missing.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"CR Matrix" <${OTP_EMAIL}>`,
      to: email,
      subject: "Your CR Matrix OTP Code",
      text: `Your OTP code is ${otp}.\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.`,
      // Plain text is fine, but adding simple HTML improves mobile readability
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #0b0f19; color: #e5e7eb; border-radius: 8px;">
          <h2 style="color: #3b82f6;">CR Matrix Verification</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px; background-color: #1f2937; display: inline-block; border-radius: 4px; margin: 10px 0; color: #ffffff;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #9ca3af;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `
    });
    
    console.log(`✉️ OTP sent successfully to: ${email}`);
    return true;
  } catch (error) {
    // Crucial: Catch transport errors so your entire register/auth route doesn't crash silently
    console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
    throw new Error("Email delivery failed");
  }
};