import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Message from "../models/message.js";

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

    socket.on("sendMessage", async ({ text, room = "general" }) => {
      try {
        if (!text?.trim()) return;

        const safeRoom = room === "feeds" ? "feeds" : "general";

        const saved = await Message.create({
          text: text.trim(),
          room: safeRoom,
          username: socket.user.username,
          role: socket.user.role,
          user: socket.user._id,
        });

        io.emit("newMessage", {
          _id: saved._id,
          text: saved.text,
          room: saved.room,
          username: saved.username,
          role: saved.role,
          isEdited: saved.isEdited,
          createdAt: saved.createdAt,
        });
      } catch (err) {
        console.error("Send message error:", err.message);
      }
    });

    socket.on("editMessage", async ({ id, text }) => {
      try {
        if (!id || !text?.trim()) return;

        const message = await Message.findById(id);
        if (!message) return;

        const canEdit =
          message.user.toString() === socket.user._id.toString() ||
          socket.user.role === "admin";

        if (!canEdit) return;

        message.text = text.trim();
        message.isEdited = true;
        await message.save();

        io.emit("messageEdited", {
          _id: message._id,
          text: message.text,
          room: message.room,
          isEdited: message.isEdited,
        });
      } catch (err) {
        console.error("Edit message error:", err.message);
      }
    });

    socket.on("deleteMessage", async ({ id }) => {
      try {
        if (!id) return;

        const message = await Message.findById(id);
        if (!message) return;

        const canDelete =
          message.user.toString() === socket.user._id.toString() ||
          socket.user.role === "admin";

        if (!canDelete) return;

        await Message.findByIdAndDelete(id);

        io.emit("messageDeleted", {
          _id: id,
          room: message.room,
        });
      } catch (err) {
        console.error("Delete message error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
    });
  });
};
