const express = require("express");

const router =
  express.Router();

const {
  handleRazorpayWebhook,
} = require(
  "../controllers/webhookController"
);

const { handleDelhiveryWebhook } = require('../controllers/delhiveryWebhookController');
const { handleShiprocketWebhook } = require('../controllers/webhookController');

router.post(
  "/razorpay",
  handleRazorpayWebhook
);

// Delhivery webhook endpoint (public)
router.post('/delhivery', express.json(), handleDelhiveryWebhook);
// Neutral path required by Shiprocket webhook URL rules.
router.post('/status', express.json(), handleShiprocketWebhook);

module.exports = router;
