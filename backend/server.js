import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

// Routes
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Socket setup
import { setupSocket } from "./socket/socket.js";

// --------------------
// Config
// --------------------
dotenv.config();

// --------------------
// App & Server
// --------------------
const app = express();
const server = http.createServer(app);

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://forex-community-app.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Forex backend running 🚀");
});

// --------------------
// Socket.io
// --------------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://forex-community-app.vercel.app",
    ],
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

// --------------------
// MongoDB
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
