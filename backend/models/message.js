import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
      default: "general-chat",
      index: true, // Speeds up filtering by room
    },
    username: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // OPTIMIZED: Store only the URL (path), not the file itself
    mediaUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// CRITICAL: Compound Index for performance
// This allows MongoDB to find messages for a specific room sorted by time almost instantly.
messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);