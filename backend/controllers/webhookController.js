const crypto = require("crypto");

const Order = require("../models/Order");

exports.handleRazorpayWebhook =
  async (req, res) => {
    try {
      const secret =
        process.env
          .RAZORPAY_WEBHOOK_SECRET;

      const signature =
        req.headers[
          "x-razorpay-signature"
        ];

      // Verify webhook signature
      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            secret
          )
          .update(
            JSON.stringify(req.body)
          )
          .digest("hex");

      if (
        expectedSignature !==
        signature
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid webhook signature",
          });
      }

      const event =
        req.body.event;

      const payment =
        req.body.payload
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

          console.log(
            "[Webhook] Payment captured:",
            order._id
          );
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

          console.log(
            "[Webhook] Payment failed:",
            order._id
          );
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
          req.body.payload
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

          console.log(
            "[Webhook] Refund processed:",
            order._id
          );
        }
      }

      return res.json({
        success: true,
      });
    } catch (err) {
      console.error(
        "[Webhook Error]",
        err
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Webhook processing failed",
        });
    }
  };