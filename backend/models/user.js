import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,

  otp: String,
  otpExpires: Date,
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model("User", userSchema);
