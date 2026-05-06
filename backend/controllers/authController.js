import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Use crypto instead of Math.random()
import User from "../models/user.js";
import { sendOtp } from "../utils/sendOTP.js";

// Helper to generate secure 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp(); // Secure generation
    const hashedOtp = await bcrypt.hash(otp, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      otpHash: hashedOtp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    await sendOtp(email, otp);
    return res.status(201).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otpHash) return res.status(400).json({ message: "Invalid request" });
    if (user.otpExpiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) return res.status(403).json({ message: "Please verify your account" });

    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Optimized: Return user profile + token in one go
    return res.json({ 
      token, 
      user: { 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};