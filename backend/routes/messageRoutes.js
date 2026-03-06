import express from "express";
import Message from "../models/message.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

// FIXED: Added Security Middleware
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Apply middleware to the route
router.get("/", protect, async (req, res) => {
  try {
    const room = req.query.room || "general-chat";

    const safeRoom = VALID_ROOMS.includes(room) ? room : "general-chat";

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