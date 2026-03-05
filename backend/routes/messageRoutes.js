import express from "express";
import Message from "../models/message.js";
import jwt from "jsonwebtoken";

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
    const room = req.query.room || "general-chat";

    const safeRoom = VALID_ROOMS.includes(room)
      ? room
      : "general-chat";

    const messages = await Message.find({ room: safeRoom })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;