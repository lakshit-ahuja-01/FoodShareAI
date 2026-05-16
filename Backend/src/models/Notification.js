import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["nearby", "expiring", "claimed", "achievement", "ngo", "expired", "system", "matched"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    unread: { type: Boolean, default: true },
    // Optional extra data (food ID, NGO name, etc.)
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
