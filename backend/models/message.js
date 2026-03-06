import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      enum: [
        "general-chat",
        "market-analysis",
        "private-team-updates",
        "live-signals",
        "one-on-one-request",
        "full-trading-course",
      ],
      default: "general-chat",
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "system"],
      default: "user",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    media: {
      type: {
        type: String,
        enum: ["image", "video"],
      },
      mimeType: String,
      dataUrl: String,
      fileName: String,
      size: Number,
    },
  },
  { timestamps: true }
);

messageSchema.pre("validate", function (next) {
  const hasText = typeof this.text === "string" && this.text.trim().length > 0;
  const hasMedia = Boolean(this.media?.dataUrl);
  if (!hasText && !hasMedia) {
    return next(new Error("Message must contain text or media"));
  }
  next();
});

export default mongoose.models.Message || mongoose.model("Message", messageSchema);