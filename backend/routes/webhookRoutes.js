const express = require("express");

const router =
  express.Router();

const {
  handleRazorpayWebhook,
} = require(
  "../controllers/webhookController"
);

const { handleShiprocketWebhook } = require('../controllers/webhookController');

router.post(
  "/razorpay",
  handleRazorpayWebhook
);

// Neutral path required by Shiprocket webhook URL rules.
router.post('/status', handleShiprocketWebhook);

module.exports = router;
