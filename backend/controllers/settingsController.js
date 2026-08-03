const Settings = require("../models/Settings");
const asyncHandler = require("../utils/asyncHandler");

// Public checkout configuration. Keep this intentionally limited so admin
// preferences are never exposed to storefront visitors.
exports.getPaymentOptions = asyncHandler(async (_req, res) => {
  const settings = await Settings.getSingleton();

  res.json({
    success: true,
    data: {
      codEnabled: settings.codEnabled !== false,
    },
  });
});
