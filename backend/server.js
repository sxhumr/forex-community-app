import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import helmet from "helmet"; // Added for security
import compression from "compression"; // Added for performance
import marketRoutes from "./routes/marketRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { setupSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Security & Performance Middleware
app.use(helmet()); // Protects against common web vulnerabilities
app.use(compression()); // Compresses responses, significantly improving speed

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
  const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
  if (isAllowed) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

app.use(cors({ origin: corsOrigin, credentials: true }));

// 2. Optimized Body Parsers
// Increased limit to 10MB to allow for larger JSON payloads (e.g., text/small meta-data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/market", marketRoutes);

app.get("/", (req, res) => {
  res.send("Forex backend running 🚀");
});

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], 
});

setupSocket(io);

// 3. Optimized Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 50, // Increases concurrent connections, crucial for chat apps
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});