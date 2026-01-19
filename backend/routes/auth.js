import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { sendOtp } from "../utils/sendOtp.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  const user = await User.create({
    fullName,
    email,
    password,
    otp: hashedOtp,
    otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins
  });

  await sendOtp(email, otp);

  res.json({ message: "OTP sent to email" });
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  if (user.otpExpires < Date.now())
    return res.status(400).json({ error: "OTP expired" });

  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid)
    return res.status(400).json({ error: "Invalid OTP" });

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ message: "OTP verified successfully" });
});

export default router;
