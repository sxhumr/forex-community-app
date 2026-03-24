import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Message from "../models/message.js";

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

export const setupSocket = (io) => {
  // 1. Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) return next(new Error("User not found"));
      if (!user.isVerified) return next(new Error("User account not verified"));

      socket.user = user; // Attach user to socket instance
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  // 2. Connection Handler
  io.on("connection", (socket) => {
    console.log(`🟢 Connected: ${socket.user.username}`);

    
      socket.on("sendMessage", async ({ text, room, media }) => {
  try {
    const VALID_TYPES = ["image/jpeg", "image/png"];
    const MAX_SIZE = 5 * 1024 * 1024;

    const safeText = typeof text === "string" ? text.trim() : "";

    let safeMedia = null;

    if (media) {
      if (
        VALID_TYPES.includes(media.mimeType) &&
        media.dataUrl?.startsWith(`data:${media.mimeType};base64,`) &&
        media.size <= MAX_SIZE
      ) {
        safeMedia = {
          mimeType: media.mimeType,
          dataUrl: media.dataUrl,
        };
      } else {
        console.log("❌ Invalid image blocked");
      }
    }

    if (!safeText && !safeMedia) return;

    const saved = await Message.create({
      text: safeText,
      room,
      username: socket.user.username,
      user: socket.user._id,
      media: safeMedia,
    });

    io.emit("newMessage", saved);
  } catch (err) {
    console.error("Send error:", err.message);
  }
});


    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.user.username}`);
    });
  });
};