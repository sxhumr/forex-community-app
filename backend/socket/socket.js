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
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) return next(new Error("User not found"));
      if (!user.isVerified) return next(new Error("Not verified"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.user.username);

    socket.on("sendMessage", async ({ text, room }) => {
      try {
        const safeRoom = VALID_ROOMS.includes(room)
          ? room
          : "general-chat";

        if (!text?.trim()) return;

        const saved = await Message.create({
          text: text.trim(),
          room: safeRoom,
          username: socket.user.username,
          user: socket.user._id,
        });

        console.log("💾 Saved message:", saved.room);

        io.emit("newMessage", saved);
      } catch (err) {
        console.error("Send error:", err.message);
      }
    });
  });
};