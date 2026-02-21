import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import marketRoutes from "./routes/marketRoutes.js";

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
// CORS Configuration
// --------------------
const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://forex-community-app.vercel.app",
  ...configuredOrigins,
];

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  const isAllowed =
    allowedOrigins.includes(origin) ||
    /^https:\/\/.*\.vercel\.app$/.test(origin);

  if (isAllowed) return callback(null, true);

  return callback(new Error("Not allowed by CORS"));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json());

// --------------------
// Routes (API Namespace)
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/market", marketRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Forex backend running 🚀");
});

// --------------------
// Socket.io
// --------------------
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
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