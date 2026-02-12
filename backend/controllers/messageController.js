import Message from "../models/message.js";

export const getMessages = async (req, res) => {
  try {
    const room = req.query.room || "general";

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return res.json(messages);
  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);
    return res.status(500).json({ message: "Failed to load messages" });
  }
};
