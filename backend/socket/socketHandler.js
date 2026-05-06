import jwt from "jsonwebtoken";
import Message from "../models/message.js";

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

export default function registerSocketHandler(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.user?.username}`);

    socket.on("joinRoom", (room) => {
      // Validate room to prevent malicious room hopping
      if (VALID_ROOMS.includes(room)) {
        socket.join(room);
      }
    });

    socket.on("sendMessage", async ({ text, room, mediaUrl }) => {
      try {
        if (!VALID_ROOMS.includes(room)) return;

        // Create message object
        // NOTE: We now expect 'mediaUrl' (a string) from the client, not 'media' (a file object)
        const newMessage = await Message.create({
          user: socket.user.userId,
          username: socket.user.username,
          role: socket.user.role,
          text: text ? text.trim() : "",
          room,
          mediaUrl: mediaUrl || null, 
        });

        // Emit only to users in this specific room
        io.to(room).emit("newMessage", newMessage);
      } catch (err) {
        console.error("Socket Message Error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.user?.username}`);
    });
  });
}