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
