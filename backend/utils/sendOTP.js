// backend/utils/sendOTP.js
export const sendOtp = async (email, otp) => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━
📧 OTP EMAIL (DEV)
To: ${email}
OTP: ${otp}
━━━━━━━━━━━━━━━━━━━━
`);
};
