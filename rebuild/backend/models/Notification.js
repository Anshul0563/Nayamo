const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title required"],
      maxlength: [200],
    },
    message: {
      type: String,
      required: [true, "Message required"],
      maxlength: [1000],
    },
    type: {
      type: String,
      enum: ["order", "payment", "shipping", "review", "admin"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // orderId, productId etc.
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model("Notification", notificationSchema);

