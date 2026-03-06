import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      enum: ["general", "feeds"],
      default: "general",
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
      mimeType: {
        type: String,
      },
      dataUrl: {
        type: String,
      },
      fileName: {
        type: String,
      },
      size: {
        type: Number,
      },
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

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
