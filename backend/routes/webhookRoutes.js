const express = require("express");
const router = express.Router();

const crypto = require("crypto");

router.post(
  "/razorpay",

  express.raw({ type: "application/json" }),

  (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      const signature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }

      const event = JSON.parse(req.body.toString());

      console.log("Webhook Event:", event.event);

      return res.json({
        success: true,
      });

    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
      });
    }
  }
);

module.exports = router;