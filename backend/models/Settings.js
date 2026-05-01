const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    autoRefresh: { type: Boolean, default: false },
    refreshInterval: { type: Number, default: 30 },
    orderAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    autoLogoutTime: { type: Number, default: 15 },
  },
  { timestamps: true }
);

// Ensure only one settings document exists
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne().lean();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
