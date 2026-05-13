const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const axiosInstance = require("../utils/axiosInstance");
const logger = require("../config/logger");

const createHmacSignature = ({ secret, rawBody }) =>
  crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

const getWebhookSecretOrFail = () => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    const err = new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
    err.code = "MISSING_RAZORPAY_WEBHOOK_SECRET";
    throw err;
  }
  return secret;
};

// Best-effort shipment creation after successful payment.
// NOTE: this is Phase A; queueing/inventory/refund are Phase B+.
async function attemptCreateDelhiveryShipment(order) {
  const delhiveryToken = process.env.DELHIVERY_API_KEY || process.env.DELHIVERY_TOKEN;
  if (!delhiveryToken) {
    logger.warn(
      `Delhivery not configured. Skipping shipment creation for order=${order._id}`
    );
    return null;
  }

  // If shipment already exists, keep idempotent.
  if (order?.delhivery?.waybill) {
    logger.info(
      `Delhivery shipment already exists. Skipping for order=${order._id} waybill=${order.delhivery.waybill}`
    );
    return order.delhivery;
  }

  // Minimal shipping payload mapping from Order

  // If your production pipeline has richer details (state/city), extend accordingly.
  // Current schema only has address + phone; Delhivery API requires city/state/pin.
  // So here we rely on address parsing only if possible is not implemented.
  // In this Phase A we still call createShipment, but it may fail with validation.
  const address = order.address || "";

  const shipmentPayload = {
    name: order.user?.name || "Nayamo Customer",
    address,
    pin: order.addressPin || process.env.DEFAULT_DELHIVERY_PIN || "110001",
    city: order.addressCity || process.env.DEFAULT_DELHIVERY_CITY || "Delhi",
    state: order.addressState || process.env.DEFAULT_DELHIVERY_STATE || "Delhi",
    phone: order.phone,
    orderId: order._id.toString(),
    paymentMode: "Prepaid",
    amount: order.totalPrice,
    quantity: (order.items || []).reduce((a, it) => a + (it.quantity || 1), 0) || 1,
    weight: 0.5,
  };

  // Controller uses axiosInstance and logger internally.
  // We call Delhivery create endpoint directly via axiosInstance.

  // Generate waybill if endpoint requires it in your flow; here we directly create shipment.

  const response = await axiosInstance.post("/api/cmu/create.json", {
    shipments: [
      {
        name: shipmentPayload.name,
        add: shipmentPayload.address.trim(),
        pin: String(shipmentPayload.pin).trim(),
        city: shipmentPayload.city.trim(),
        state: shipmentPayload.state.trim(),
        country: "India",
        phone: shipmentPayload.phone.trim(),
        order: shipmentPayload.orderId,
        payment_mode: shipmentPayload.paymentMode || "Prepaid",
        total_amount: Number(shipmentPayload.amount),
        quantity: Number(shipmentPayload.quantity || 1),
        weight: Number(shipmentPayload.weight || 0.5),
      },
    ],
    pickup_location: {
      name: "Nayamo Warehouse",
    },
  });

  // Persist what we can.
  const data = response?.data || {};
  const waybill = data?.waybill || data?.shipment_id || data?.shipment?.waybill;
  const trackingUrl = data?.tracking_url || data?.trackingUrl;
  const labelUrl = data?.label_url || data?.labelUrl;

  order.delhivery = {
    ...(order.delhivery || {}),
    waybill: waybill || order.delhivery.waybill,
    trackingUrl: trackingUrl || order.delhivery.trackingUrl,
    labelUrl: labelUrl || order.delhivery.labelUrl,
    courier: "Delhivery",
    shipmentStatus: data?.status || "created",
    createdAt: new Date(),
    fullResponse: data,
  };

  await order.save();
  logger.info(
    `Delhivery shipment created for order=${order._id} waybill=${order.delhivery.waybill}`
  );
  return order.delhivery;
}

// Razorpay webhook: https://razorpay.com/docs/webhooks
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = getWebhookSecretOrFail();

      const signature = req.headers["x-razorpay-signature"];
      if (!signature) {
        logger.warn("Razorpay webhook missing x-razorpay-signature header");
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }

      const expectedSignature = createHmacSignature({
        secret,
        rawBody: req.body,
      });

      // Use constant-time compare
      const isMatch = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isMatch) {
        logger.warn("Razorpay webhook signature mismatch");
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }

      const event = JSON.parse(req.body.toString("utf8"));
      const eventType = event?.event;
      const payload = event?.payload || {};
      const eventId = event?.id || event?.created_at || null;

      logger.info(
        `Razorpay webhook received type=${eventType} order=${payload?.payment?.entity?.order_id || payload?.order?.entity?.id || payload?.order?.entity?.receipt || "unknown"} id=${eventId || "n/a"}`
      );

      // Idempotency: store processed webhook IDs where possible.
      // Because Order schema currently only has idempotencyKey for orders, we rely on
      // payment capture identifiers for replay protection.
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;

      const razorpayPaymentId = paymentEntity?.id || null;
      const razorpayOrderId = orderEntity?.id || payload?.order_id || null;
      const razorpaySignature = payload?.payment?.entity?.signature || null;


      // Attempt to locate MongoDB order.
      // Our createPaymentOrder sets notes.mongoOrderId. So prefer that.
      const mongoOrderId = paymentEntity?.notes?.mongoOrderId ||
        orderEntity?.notes?.mongoOrderId ||
        paymentEntity?.order_id && payload?.order_id && null;

      let order = null;

      if (mongoOrderId && mongoose.Types.ObjectId.isValid(mongoOrderId)) {
        order = await Order.findById(mongoOrderId);
      } else if (razorpayOrderId) {
        // Fallback to razorpayOrderId field
        order = await Order.findOne({ razorpayOrderId: razorpayOrderId });
      }

      if (!order) {
        logger.warn(
          `Razorpay webhook: Order not found for mongoOrderId=${mongoOrderId || "n/a"} razorpayOrderId=${razorpayOrderId || "n/a"}`
        );
        return res.json({ success: true, message: "Order not found - ignored" });
      }

      // Prevent duplicates (payment-level)
      if (razorpayPaymentId && order.razorpayPaymentId && order.razorpayPaymentId === razorpayPaymentId) {
        logger.info(
          `Razorpay webhook idempotent hit. paymentId=${razorpayPaymentId} order=${order._id}`
        );
        return res.json({ success: true, message: "Already processed" });
      }

      if (eventType === "payment.captured" || eventType === "order.paid") {
        if (order.isPaid) {
          logger.info(
            `Order already marked paid. order=${order._id} paymentStatus=${order.paymentStatus}`
          );
          return res.json({ success: true, message: "Already paid" });
        }

        // Mark order paid
        order.isPaid = true;
        order.paymentStatus = "paid";
        order.paidAt = new Date();

        order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
        order.razorpaySignature =
          paymentEntity?.signature || payload?.payment?.entity?.signature ||
          razorpaySignature ||
          order.razorpaySignature;

        // Store some webhook payload for debugging
        order.razorpayWebhook = {
          eventType,
          eventId: event?.id || null,
          raw: event,
        };

        await order.save();

        logger.info(`Order marked paid via webhook order=${order._id}`);

        // Trigger Delhivery shipment creation (best-effort)
        try {
          await attemptCreateDelhiveryShipment(order);
        } catch (shipErr) {
          // Do not fail webhook; Razorpay will retry if we return non-2xx.
          logger.error(
            `Delhivery shipment creation failed order=${order._id}: ${shipErr.message}`
          );
          order.delhivery = {
            ...(order.delhivery || {}),
            courier: order.delhivery?.courier || "Delhivery",
            shipmentStatus: "shipment_creation_failed",
            fullResponse: {
              ...(order.delhivery?.fullResponse || {}),
              error: {
                message: shipErr.message,
                stack: shipErr.stack,
              },
            },
          };
          await order.save();
        }

        return res.json({ success: true });
      }

      if (eventType === "payment.failed") {
        // Mark payment failed
        order.paymentStatus = "failed";
        order.isPaid = false;

        order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
        order.razorpayWebhook = {
          eventType,
          eventId: event?.id || null,
          raw: event,
        };

        await order.save();
        logger.info(`Order payment failed via webhook order=${order._id}`);

        return res.json({ success: true });
      }

      // Unknown event: acknowledge
      logger.info(`Unhandled Razorpay webhook event type=${eventType}`);
      return res.json({ success: true });
    } catch (error) {
      logger.error("Razorpay webhook error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Webhook processing failed",
      });
    }
  }
);

module.exports = router;

