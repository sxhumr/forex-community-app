import Message from "../models/message.js";

const VALID_ROOMS = [
  "general-chat",
  "market-analysis",
  "private-team-updates",
  "live-signals",
  "one-on-one-request",
  "full-trading-course",
];

export const getMessages = async (req, res) => {
  try {
    const room = req.query.room || "general-chat";
    
    // 1. Security: Whitelist rooms
    if (!VALID_ROOMS.includes(room)) {
      return res.status(400).json({ message: "Invalid room" });
    }

    // 2. Optimization: Sort newest first, limit to 50 for mobile smoothness
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(50) 
      .populate('user', 'username') // Fetch the latest username from User model
      .lean();

    // 3. UX: Reverse the array so the oldest is at the top, newest at bottom (chat style)
    return res.json(messages.reverse());
    
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    return res.status(500).json({ message: "Failed to load messages" });
  }
};