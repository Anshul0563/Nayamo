const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "object"],
      default: "string",
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

settingsSchema.index({ key: 1 });

module.exports = mongoose.model("Settings", settingsSchema);

