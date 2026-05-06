import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { sendOtp } from "../utils/sendOTP.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. SECURITY: Hash the user's login password (NEVER save plain text)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Generate and Hash OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 3. Set expiry correctly
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    // 4. Create User
    await User.create({
      username,
      email,
      password: hashedPassword, // Using the hashed password
      otp: hashedOtp,
      otpExpires: otpExpires,
      isVerified: false,
    });

    await sendOtp(email, otp);

    res.status(201).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Registration failed. Email might already exist." });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  // Check if OTP is expired
  if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // Verify OTP
  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid) return res.status(400).json({ error: "Invalid OTP" });

  // Update User state
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ message: "OTP verified successfully" });
});

export default router;