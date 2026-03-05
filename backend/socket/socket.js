import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Message from "../models/message.js";

const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

const sanitizeMedia = (media) => {
  if (!media) return null;

  const { type, mimeType, dataUrl, fileName, size } = media;

  if (!type || !mimeType || !dataUrl) return null;

  const isImage = type === "image" && IMAGE_TYPES.has(mimeType);
  const isVideo = type === "video" && VIDEO_TYPES.has(mimeType);

  if (!isImage && !isVideo) return null;

  if (!dataUrl.startsWith(`data:${mimeType};base64,`)) return null;

  if (!size || size > MAX_MEDIA_SIZE_BYTES) return null;

  return {
    type,
    mimeType,
    dataUrl,
    fileName,
    size,
  };
};

export const setupSocket = (io) => {

  /* ============================
     AUTH MIDDLEWARE
  ============================ */
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

      if (!user) return next(new Error("User not found"));

      if (!user.isVerified)
        return next(new Error("User not verified"));

      socket.user = user;

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  /* ============================
     CONNECTION
  ============================ */
  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.username} connected`);

    /* ============================
       SEND MESSAGE
    ============================ */
    socket.on("sendMessage", async ({ text, room, media }) => {
      try {
        const safeText = typeof text === "string" ? text.trim() : "";

        let safeMedia = null;

        /* Only Robert can upload media */
        if (media && socket.user.username === "robert") {
          safeMedia = sanitizeMedia(media);
        }

        if (!safeText && !safeMedia) return;

        const safeRoom = VALID_ROOMS.includes(room)
          ? room
          : "general-chat";

        const saved = await Message.create({
          text: safeText,
          media: safeMedia,
          room: safeRoom,
          username: socket.user.username,
          role: socket.user.role,
          user: socket.user._id,
        });

        io.emit("newMessage", {
          _id: saved._id,
          text: saved.text,
          media: saved.media,
          room: saved.room,
          username: saved.username,
          role: saved.role,
          user: saved.user,
          isEdited: saved.isEdited,
          createdAt: saved.createdAt,
        });
      } catch (err) {
        console.error("Send message error:", err.message);
      }
    });

    /* ============================
       EDIT MESSAGE
    ============================ */
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
          isEdited: true,
        });
      } catch (err) {
        console.error("Edit message error:", err.message);
      }
    });

    /* ============================
       DELETE MESSAGE
    ============================ */
    socket.on("deleteMessage", async ({ id }) => {
      try {
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