const crypto = require("crypto");

const Order = require("../models/Order");
const logger = require("../config/logger");

exports.handleRazorpayWebhook =
  async (req, res) => {
    try {
      const secret =
        process.env
          .RAZORPAY_WEBHOOK_SECRET;

      if (!secret) {
        logger.error("Razorpay webhook secret is not configured");
        return res.status(503).json({
          success: false,
          message: "Webhook service unavailable",
        });
      }

      const signature =
        req.headers[
          "x-razorpay-signature"
        ];

      const rawBody = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(req.body));

      // Verify webhook signature
      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            secret
          )
          .update(rawBody)
          .digest("hex");

      const expectedBuffer = Buffer.from(expectedSignature);
      const receivedBuffer = Buffer.from(signature || "");

      if (
        expectedBuffer.length !== receivedBuffer.length ||
        !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid webhook signature",
          });
      }

      const payload = Buffer.isBuffer(req.body)
        ? JSON.parse(rawBody.toString("utf8"))
        : req.body;

      const event =
        payload.event;

      const payment =
        payload.payload
          ?.payment?.entity;

      // =========================
      // PAYMENT CAPTURED
      // =========================
      if (
        event ===
        "payment.captured"
      ) {
        const order =
          await Order.findOne({
            razorpayOrderId:
              payment.order_id,
          });

        if (order) {
          order.isPaid = true;

          order.paymentStatus =
            "paid";

          order.paidAt =
            new Date();

          order.razorpayPaymentId =
            payment.id;

          await order.save();

          logger.info(`Webhook payment captured: ${order._id}`);
        }
      }

      // =========================
      // PAYMENT FAILED
      // =========================
      if (
        event ===
        "payment.failed"
      ) {
        const order =
          await Order.findOne({
            razorpayOrderId:
              payment.order_id,
          });

        if (order) {
          order.paymentStatus =
            "failed";

          await order.save();

          logger.info(`Webhook payment failed: ${order._id}`);
        }
      }

      // =========================
      // REFUND PROCESSED
      // =========================
      if (
        event ===
        "refund.processed"
      ) {
        const refund =
          payload.payload
            ?.refund?.entity;

        const order =
          await Order.findOne({
            refundId:
              refund.id,
          });

        if (order) {
          order.refundStatus =
            "processed";

          order.paymentStatus =
            "refunded";

          order.refundedAt =
            new Date();

          await order.save();

          logger.info(`Webhook refund processed: ${order._id}`);
        }
      }

      return res.json({
        success: true,
      });
    } catch (err) {
      logger.error(`Webhook processing failed: ${err.message}`);

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Webhook processing failed",
        });
    }
  };
