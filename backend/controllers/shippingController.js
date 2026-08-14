const Order = require("../models/Order");

const delhiveryService =
  require("../services/delhiveryService");

const asyncHandler =
  require("../utils/asyncHandler");

// =========================
// CREATE SHIPMENT (ADMIN ONLY)
// =========================
exports.createShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Already shipped (idempotent per order)
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
    pickupRequested: false,
  };

  // Shipment creation does not trigger a pickup request; the admin must do that explicitly.
  order.status = "confirmed";

  await order.save();

  res.json({
    success: true,
    message: "Shipment created successfully",
    data: order,
  });
});

// =========================
// REQUEST PICKUP (ADMIN ONLY)
// =========================
exports.requestPickup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.delhivery?.waybill) {
    res.status(400);
    throw new Error("Shipment must be created before requesting pickup");
  }

  if (order.delhivery.pickupRequested) {
    return res.json({
      success: true,
      message: "Pickup already requested",
      data: order,
    });
  }

  if (!['confirmed', 'ready_to_ship'].includes(order.status)) {
    res.status(400);
    throw new Error("Pickup can only be requested for confirmed or ready-to-ship orders");
  }

  order.delhivery.pickupRequested = true;
  order.status = "pickup_requested";
  order.statusUpdatedAt = new Date();

  await order.save();

  res.json({
    success: true,
    message: "Pickup requested successfully",
    data: order,
  });
});

// =========================
// GET SHIPMENT LABEL
// =========================
exports.getShipmentLabel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.delhivery?.waybill) {
    res.status(400);
    throw new Error("Shipment must be created before downloading the label");
  }

  if (!order.delhivery.labelUrl) {
    res.status(404);
    throw new Error("Shipment label is not available yet");
  }

  res.json({
    success: true,
    message: "Shipment label ready",
    data: {
      waybill: order.delhivery.waybill,
      labelUrl: order.delhivery.labelUrl,
    },
  });
});

// =========================
// CREATE RETURN SHIPMENT
// =========================
exports.createReturnShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.delhivery?.waybill) {
    res.status(400);
    throw new Error("Original shipment must be created before arranging a return shipment");
  }

  if (order.returnShipment?.waybill) {
    return res.json({
      success: true,
      message: "Return shipment already created",
      data: order,
    });
  }

  const shipment = await delhiveryService.createShipment(order);

  order.returnShipment = {
    waybill: shipment.waybill,
    trackingUrl: shipment.trackingUrl,
    labelUrl: shipment.labelUrl || undefined,
    pickupRequested: false,
    createdAt: new Date(),
  };

  await order.save();

  res.json({
    success: true,
    message: "Return shipment created successfully",
    data: order,
  });
});

// =========================
// REQUEST RETURN PICKUP
// =========================
exports.requestReturnPickup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.returnShipment?.waybill) {
    res.status(400);
    throw new Error("Return shipment must be created before requesting pickup");
  }

  if (order.returnShipment.pickupRequested) {
    return res.json({
      success: true,
      message: "Return pickup already requested",
      data: order,
    });
  }

  if (!['return_requested', 'returned'].includes(order.status)) {
    res.status(400);
    throw new Error("Return pickup can only be requested for return-related orders");
  }

  order.returnShipment.pickupRequested = true;
  order.statusUpdatedAt = new Date();

  await order.save();

  res.json({
    success: true,
    message: "Return pickup requested successfully",
    data: order,
  });
});

// =========================
// GET RETURN SHIPMENT LABEL
// =========================
exports.getReturnLabel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.returnShipment?.waybill) {
    res.status(400);
    throw new Error("Return shipment must be created before downloading the label");
  }

  if (!order.returnShipment.labelUrl) {
    res.status(404);
    throw new Error("Return shipment label is not available yet");
  }

  res.json({
    success: true,
    message: "Return shipment label ready",
    data: {
      waybill: order.returnShipment.waybill,
      labelUrl: order.returnShipment.labelUrl,
    },
  });
});

// =========================
// TRACK ORDER
// =========================
exports.trackShipment =
  asyncHandler(
    async (req, res) => {
      const order =
        await Order.findById(
          req.params.id
        );

      if (
        !order ||
        !order.delhivery
          ?.waybill
      ) {
        res.status(404);

        throw new Error(
          "Shipment not found"
        );
      }

      const tracking =
        await delhiveryService.trackShipment(
          order.delhivery
            .waybill
        );

      res.json({
        success: true,
        data: tracking,
      });
    }
  );
