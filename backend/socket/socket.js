import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Message from "../models/message.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export const setupSocket = (io) => {
  /* =========================
     🔐 AUTH MIDDLEWARE
  ========================== */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token provided"));
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

      socket.user = user;

      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  /* =========================
     🔌 CONNECTION
  ========================== */
  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.username} connected`);

    /* =========================
       📩 SEND MESSAGE
    ========================== */
    socket.on("sendMessage", async ({ text, room, media }) => {
      try {
        const safeText =
          typeof text === "string" ? text.trim() : "";

        let safeMedia = null;

        /* 📷 HANDLE IMAGE */
        if (media) {
          console.log("📷 Incoming media");

          if (
            ALLOWED_TYPES.includes(media.mimeType) &&
            media.dataUrl?.startsWith(
              `data:${media.mimeType};base64,`
            ) &&
            media.size <= MAX_FILE_SIZE
          ) {
            safeMedia = {
              mimeType: media.mimeType,
              dataUrl: media.dataUrl,
            };

            console.log("✅ Image accepted");
          } else {
            console.log("❌ Invalid image rejected");
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

        console.log("💾 Message saved:", saved._id);

        io.emit("newMessage", saved);
      } catch (err) {
        console.error("❌ Send message error:", err.message);
      }
    });

    /* =========================
       🗑 DELETE MESSAGE
    ========================== */
    socket.on("deleteMessage", async ({ id }) => {
      try {
        const message = await Message.findById(id);

        if (!message) return;

        // Only owner can delete
        if (
          message.user.toString() !==
          socket.user._id.toString()
        ) {
          console.log("❌ Unauthorized delete attempt");
          return;
        }

        await Message.findByIdAndDelete(id);

        console.log("🗑 Message deleted:", id);

        io.emit("messageDeleted", {
          _id: id,
          room: message.room,
        });
      } catch (err) {
        console.error("❌ Delete error:", err.message);
      }
    });

    /* =========================
       🔌 DISCONNECT
    ========================== */
    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.user.username} disconnected`);
    });
  });
};