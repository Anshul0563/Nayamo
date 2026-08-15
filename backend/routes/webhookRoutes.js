const express = require("express");

const router =
  express.Router();

const {
  handleRazorpayWebhook,
} = require(
  "../controllers/webhookController"
);

const { handleDelhiveryWebhook } = require('../controllers/delhiveryWebhookController');

router.post(
  "/razorpay",
  handleRazorpayWebhook
);

// Delhivery webhook endpoint (public)
router.post('/delhivery', express.json(), handleDelhiveryWebhook);

module.exports = router;
