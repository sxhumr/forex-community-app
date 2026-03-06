import jwt from "jsonwebtoken";
import Message from "../models/message.js";

export default function registerSocketHandler(io) {
  // 1. AUTH MIDDLEWARE: Decodes token before connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Now socket.user.username exists!
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user?.username}`);

    socket.on("joinRoom", (room) => {
      socket.join(room);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { text, room, media } = data;
        
        // Use data from the authenticated socket.user
        const newMessage = await Message.create({
          user: socket.user.userId,
          username: socket.user.username,
          role: socket.user.role,
          text,
          room,
          media
        });

        io.to(room).emit("newMessage", newMessage);
      } catch (err) {
        console.error("Socket Message Error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}