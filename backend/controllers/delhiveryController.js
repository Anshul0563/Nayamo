const api = require("../utils/axiosInstance");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

// Generate Waybill
exports.generateWaybill = asyncHandler(async (req, res) => {
  const response = await api.get("/api/v1/packages/json/");
  res.json({
    success: true,
    data: response.data,
  });
});

// Create Shipment (admin controlled)
exports.createShipment = asyncHandler(async (req, res) => {
  const orderId = req.body?.orderId || req.body?.id;
  if (!orderId) {
    res.status(400);
    throw new Error("orderId is required");
  }

  const Order = require("../models/Order");
  const delhiveryService = require("../services/delhiveryService");

  const order = await Order.findById(orderId).populate("user", "name");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.delhivery?.waybill) {
    return res.json({
      success: true,
      message: "Shipment already created",
      data: order,
    });
  }

  const shipment = await delhiveryService.createShipment(order);

  order.delhivery = {
    waybill: shipment.waybill,
    trackingUrl: shipment.trackingUrl,
    labelUrl: shipment.labelUrl || undefined,
    createdAt: new Date(),
    pickupRequested: order.delhivery?.pickupRequested || false,
  };

  order.status = "confirmed";

  await order.save();

  logger.info(`Shipment created for order: ${orderId}`);

  res.json({
    success: true,
    message: "Shipment created successfully",
    data: order,
  });
});



// Track Shipment (aligned with delhiveryService)
exports.trackShipment = asyncHandler(async (req, res) => {
  const { waybill } = req.params;

  if (!waybill) {
    res.status(400);
    throw new Error("Waybill number is required");
  }

  const delhiveryService = require("../services/delhiveryService");
  const tracking = await delhiveryService.trackShipment(waybill);

  res.json({
    success: true,
    data: tracking,
  });
});


// Cancel Shipment
exports.cancelShipment = asyncHandler(async (req, res) => {
  const { waybill } = req.body;

  if (!waybill) {
    res.status(400);
    throw new Error("Waybill number is required");
  }

  // NOTE: cancellation behavior is not currently unified in delhiveryService.
  // Keep existing endpoint, but validate response and persist if needed later.
  const response = await api.post("/api/p/edit", {
    waybill,
    cancellation: true,
  });

  logger.info(`Shipment cancelled: ${waybill}`);

  res.json({
    success: true,
    data: response.data,
  });
});

