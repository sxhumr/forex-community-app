import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const setupSocket = (io) => {
  // 🔐 Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select(
        "_id username role isVerified"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      if (!user.isVerified) {
        return next(new Error("User not verified"));
      }

      // ✅ Trusted identity attached to socket
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  // 🔌 Socket events
  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.username} connected`);

    socket.on("sendMessage", ({ text }) => {
      if (!text) return;

      const message = {
        text,
        username: socket.user.username,
        role: socket.user.role,
        createdAt: new Date(),
      };

      // Broadcast to all clients
      io.emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
    });
  });
};
