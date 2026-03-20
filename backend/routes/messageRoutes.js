import express from "express";
import Message from "../models/message.js";

const router = express.Router();

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

router.get("/", async (req, res) => {
  try {
    const room = req.query.room;

    const safeRoom = VALID_ROOMS.includes(room)
      ? room
      : "general-chat";

    console.log("📥 Fetching messages for:", safeRoom);

    const messages = await Message.find({ room: safeRoom })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;