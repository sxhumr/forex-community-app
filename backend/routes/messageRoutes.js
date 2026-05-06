import express from "express";
import Message from "../models/message.js";
// Assuming you have an auth middleware
import { protectRoute } from "../middleware/authMiddleware.js"; 

const router = express.Router();

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

// Added 'protectRoute' to ensure only logged-in users fetch messages
router.get("/", protectRoute, async (req, res) => {
  try {
    const room = req.query.room;
    // Set a default limit of 50, or accept a user-provided limit
    const limit = parseInt(req.query.limit) || 50; 
    
    const safeRoom = VALID_ROOMS.includes(room) ? room : "general-chat";

    console.log(`📥 Fetching last ${limit} messages for: ${safeRoom}`);

    // OPTIMIZATIONS:
    // 1. .sort({ createdAt: -1 }) -> Gets newest messages first
    // 2. .limit(limit) -> Only pulls the last 50 (Crucial for speed)
    // 3. .lean() -> Skips Mongoose document overhead (Faster JSON serialization)
    const messages = await Message.find({ room: safeRoom })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(); 

    // Reverse them back to chronological order for the UI
    res.json(messages.reverse());
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;