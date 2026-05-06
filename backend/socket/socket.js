import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Message from "../models/message.js";

export const setupSocket = (io) => {
  /* =========================
     🔐 AUTH MIDDLEWARE
  ========================== */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("_id username role isVerified").lean();

      if (!user || !user.isVerified) return next(new Error("User unauthorized"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  /* =========================
     🔌 CONNECTION
  ========================== */
  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.username} connected`);

    // Join a specific room based on query
    const room = socket.handshake.query.room || "general-chat";
    socket.join(room);

    /* 📩 SEND MESSAGE (URL ONLY) */
    socket.on("sendMessage", async ({ text, room, mediaUrl }) => {
      try {
        // Validate payload
        const safeText = typeof text === "string" ? text.trim() : "";
        if (!safeText && !mediaUrl) return;

        const saved = await Message.create({
          text: safeText,
          room,
          username: socket.user.username,
          user: socket.user._id,
          mediaUrl: mediaUrl || null, // We save only the link!
        });

        // OPTIMIZED: Use 'to(room)' instead of 'emit' to all
        // Only users in the room receive the update
        io.to(room).emit("newMessage", saved);
        
      } catch (err) {
        console.error("❌ Send message error:", err.message);
      }
    });

    /* 🗑 DELETE MESSAGE */
    socket.on("deleteMessage", async ({ id }) => {
      try {
        const message = await Message.findById(id);
        if (!message || message.user.toString() !== socket.user._id.toString()) return;

        await Message.findByIdAndDelete(id);
        
        // Notify only the room
        io.to(message.room).emit("messageDeleted", { _id: id });
      } catch (err) {
        console.error("❌ Delete error:", err.message);
      }
    });

    socket.on("disconnect", () => console.log(`🔴 ${socket.user.username} disconnected`));
  });
};