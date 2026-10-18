
const Order = require("../models/Order");
const logger = require("../config/logger");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const { getShiprocketWebhookToken, isConfigured } = require("../config/env");

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

const mapShiprocketStatus = (value) => {
  const status = String(value || "").toLowerCase();
  if (/delivered/.test(status)) return "delivered";
  if (/out for delivery|out_for_delivery/.test(status)) return "out_for_delivery";
  if (/rto|return to origin|returned/.test(status)) return "rto";
  if (/cancel/.test(status)) return "cancelled";
  if (/pickup|in transit|transit|shipped|dispatched/.test(status)) return "in_transit";
  return null;
};

const SHIPMENT_STATUS_RANK = {
  created: 0,
  pickup_requested: 10,
  in_transit: 20,
  out_for_delivery: 30,
  rto: 80,
  cancelled: 90,
  delivered: 100,
};

const canAdvanceOrderStatus = (current, next) => {
  if (current === "delivered" || current === "cancelled") return false;
  return (SHIPMENT_STATUS_RANK[next] || 0) >= (SHIPMENT_STATUS_RANK[current] || 0);
};

exports.handleShiprocketWebhook = asyncHandler(async (req, res) => {
  const configured = getShiprocketWebhookToken();
  if (!isConfigured(configured)) {
    return res.status(503).json({ success: false, message: "Webhook authentication is not configured" });
  }
  {
    const received = String(req.headers["x-api-key"] || "");
    const a = Buffer.from(received);
    const b = Buffer.from(configured);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ success: false, message: "Invalid webhook token" });
    }
  }
  const payload = req.body || {};
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: "Invalid webhook payload" });
  }
  const awb = payload.awb || payload.awb_code;
  const sourceOrderId = payload.order_id || payload.sr_order_id;
  const providerShipmentId = payload.shipment_id || payload.sr_shipment_id;
  const status = payload.current_status || payload.shipment_status || payload.status;
  if ((!awb && !sourceOrderId && !providerShipmentId) || !status) {
    return res.status(400).json({ success: false, message: "Webhook event is missing shipment identity or status" });
  }
  const query = awb
    ? { $or: [{ "shiprocket.awb": String(awb) }, { "returnShipment.waybill": String(awb) }] }
    : providerShipmentId
      ? { $or: [{ "shiprocket.shipmentId": String(providerShipmentId) }, { "returnShipment.shipmentId": String(providerShipmentId) }] }
      : { $or: [{ "shiprocket.orderId": String(sourceOrderId) }, { "returnShipment.orderId": String(sourceOrderId) }] };
  const order = await Order.findOne(query);
  if (!order) return res.json({ success: true, message: "No matching order" });
  const orderIds = [order.shiprocket?.orderId, order.returnShipment?.orderId].filter(Boolean).map(String);
  const shipmentIds = [order.shiprocket?.shipmentId, order.returnShipment?.shipmentId].filter(Boolean).map(String);
  if (sourceOrderId && !orderIds.includes(String(sourceOrderId)) && !providerShipmentId) {
    return res.status(400).json({ success: false, message: "Webhook order does not match the shipment" });
  }
  if (providerShipmentId && !shipmentIds.includes(String(providerShipmentId))) {
    return res.status(400).json({ success: false, message: "Webhook shipment does not match the order" });
  }
  const eventKey = `${payload.current_status || payload.shipment_status || "unknown"}:${payload.current_timestamp || payload.updated_at || ""}`;
  const isReturn = Boolean(
    (providerShipmentId && String(order.returnShipment?.shipmentId) === String(providerShipmentId)) ||
    (awb && String(order.returnShipment?.waybill) === String(awb)) ||
    (sourceOrderId && String(order.returnShipment?.orderId) === String(sourceOrderId)),
  );
  const events = isReturn ? (order.returnShipment.events || []) : (order.shiprocket.events || []);
  if (events.some((event) => event.key === eventKey)) return res.json({ success: true, message: "Duplicate event ignored" });
  const mapped = mapShiprocketStatus(status);
  const shipment = isReturn ? order.returnShipment : order.shiprocket;
  shipment.lastWebhook = payload;
  shipment.lastWebhookAt = new Date();
  shipment.events = [...events.slice(-49), { key: eventKey, status, receivedAt: new Date() }];
  if (payload.courier_name) shipment.courier = payload.courier_name;
  if (awb) { shipment.awb = String(awb); if (isReturn) shipment.waybill = String(awb); }
  if (mapped) {
    // Shiprocket sends display labels such as "IN TRANSIT". Persist the
    // canonical Nayamo status so the admin UI and order lifecycle use the
    // same values as the rest of the application.
    shipment.status = mapped;
    if (!isReturn && order.status !== mapped && canAdvanceOrderStatus(order.status, mapped)) {
      order.status = mapped;
      order.statusUpdatedAt = new Date();
      if (mapped === "delivered") order.deliveredAt = new Date();
    }
  }
  await order.save();
  return res.json({ success: true, message: "Processed" });
});
