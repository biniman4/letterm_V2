import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["new_letter", "letter_read", "letter_starred", "urgent_letter"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedLetter: { type: mongoose.Schema.Types.ObjectId, ref: "Letter" },
    read: { type: Boolean, default: false },
    priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
