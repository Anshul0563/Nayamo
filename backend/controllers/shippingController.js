const mongoose = require("mongoose");
const Order = require("../models/Order");

const shiprocketService = require("../services/shiprocketService");
const delhiveryService = require("../services/delhiveryService");

const asyncHandler =
  require("../utils/asyncHandler");

// =========================
// CREATE SHIPMENT (ADMIN ONLY)
// =========================
exports.createShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product", "title");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.delhivery?.waybill || order.shiprocket?.orderId) {
    return res.json({
      success: true,
      message: "Shipment already created",
      data: order,
    });
  }

  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, "shiprocket.orderId": { $exists: false }, "shiprocket.creationStatus": { $ne: "creating" }, "delhivery.waybill": { $exists: false } },
    { $set: { "shiprocket.creationStatus": "creating", "shiprocket.creationLockAt": new Date(), "shiprocket.creationAttemptedAt": new Date(), "shiprocket.creationAttemptId": new mongoose.Types.ObjectId().toString() } },
    { new: true },
  );
  if (!claimed) {
    res.status(409);
    throw new Error("Shipment creation is already in progress or the order has a shipment");
  }

  try {
    const created = await shiprocketService.createOrder(order);
    const ids = shiprocketService.extractShipment(created);
    if (!ids.orderId || !ids.shipmentId) throw new Error("Shiprocket returned no order or shipment ID");
    order.shiprocket = { orderId: String(ids.orderId), shipmentId: String(ids.shipmentId), creationStatus: "created", createdAt: new Date(), updatedAt: new Date(), pickupRequested: false };
    await order.save();

    try {
      const awbResponse = await shiprocketService.assignAwb(ids.shipmentId);
      const awb = shiprocketService.extractAwb(awbResponse);
      order.shiprocket.awb = awb.awb;
      order.shiprocket.courier = awb.courier;
      order.shiprocket.status = awb.awb ? "awb_assigned" : "created";
      order.shiprocket.updatedAt = new Date();
      if (awb.awb) order.shiprocket.trackingUrl = `https://shiprocket.co/tracking/${awb.awb}`;
      await order.save();
    } catch (error) {
      // The Shiprocket order is retained so an admin can retry assignment safely.
      order.shiprocket.status = "awb_pending";
      order.shiprocket.updatedAt = new Date();
      await order.save();
    }

    if (order.shiprocket.awb) {
      try {
        await shiprocketService.requestPickup(ids.shipmentId);
        order.shiprocket.pickupRequested = true;
        order.shiprocket.status = "pickup_requested";
        await order.save();
      } catch (error) { /* pickup can be retried from the admin action */ }
      try {
        const label = await shiprocketService.generateLabel(ids.shipmentId);
        order.shiprocket.labelUrl = label?.label_url || label?.labelUrl;
        await order.save();
      } catch (error) { /* label can be generated later */ }
    }
    order.status = order.shiprocket.pickupRequested ? "pickup_requested" : "ready_to_ship";
    order.statusUpdatedAt = new Date();
    await order.save();
  } catch (error) {
    await Order.updateOne(
      { _id: order._id, "shiprocket.orderId": { $exists: false } },
      { $set: { "shiprocket.creationStatus": error.ambiguous ? "reconciliation_required" : "failed", "shiprocket.lastCreationError": error.message }, $unset: { "shiprocket.creationLockAt": 1 } },
    );
    throw error;
  }

  // Emit socket event to notify admin/frontends about status change
  try {
    if (global && global.io) {
      global.io.emit("order:status_updated", {
        orderId: order._id,
        status: order.status,
        updatedAt: order.statusUpdatedAt || new Date(),
      });
    }
  } catch (err) {
    // silent
  }

  res.json({
    success: true,
    message: "Shiprocket shipment created successfully",
    data: order,
  });
});

exports.assignAwb = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (!order.shiprocket?.shipmentId) { res.status(400); throw new Error("Shipment must be created before assigning an AWB"); }
  if (order.shiprocket.awb) return res.json({ success: true, message: "AWB already assigned", data: order });
  const result = shiprocketService.extractAwb(await shiprocketService.assignAwb(order.shiprocket.shipmentId));
  if (!result.awb) { res.status(502); throw new Error("Shiprocket did not assign an AWB"); }
  order.shiprocket.awb = result.awb;
  order.shiprocket.courier = result.courier;
  order.shiprocket.trackingUrl = `https://shiprocket.co/tracking/${result.awb}`;
  order.shiprocket.status = "awb_assigned";
  order.shiprocket.updatedAt = new Date();
  await order.save();
  res.json({ success: true, message: "AWB assigned successfully", data: order });
});

exports.cancelShipment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (!order.shiprocket?.orderId) { res.status(400); throw new Error("Shiprocket shipment not found"); }
  if (["delivered", "cancelled", "rto"].includes(order.shiprocket.status)) {
    res.status(409);
    throw new Error("Shipment cannot be cancelled in its current state");
  }
  await shiprocketService.cancelOrder(order.shiprocket.orderId);
  order.shiprocket.status = "cancelled";
  order.shiprocket.updatedAt = new Date();
  order.status = "cancelled";
  order.statusUpdatedAt = new Date();
  await order.save();
  res.json({ success: true, message: "Shipment cancelled successfully", data: order });
});

exports.createBulkShipment = asyncHandler(async (req, res) => {
  const rawOrderIds = Array.isArray(req.body?.orderIds) ? req.body.orderIds : [];
  const uniqueOrderIds = [...new Set(rawOrderIds.map(String))];

  const validIds = [];
  const invalidResults = [];

  uniqueOrderIds.forEach((orderId) => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      invalidResults.push({
        orderId,
        status: "skipped",
        message: "Invalid order ID",
      });
      return;
    }

    validIds.push(orderId);
  });

  const orders = await Order.find({ _id: { $in: validIds } }).populate("user", "name email").populate("items.product", "title");
  const orderMap = new Map(orders.map((order) => [String(order._id), order]));

  const results = [...invalidResults];
  const summary = {
    total: validIds.length,
    created: 0,
    skipped: 0,
    failed: 0,
  };

  for (const orderId of validIds) {
    let order = orderMap.get(orderId);

    if (!order) {
      summary.skipped += 1;
      results.push({
        orderId,
        status: "skipped",
        message: "Order not found",
      });
      continue;
    }

    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, "shiprocket.orderId": { $exists: false }, "shiprocket.creationStatus": { $nin: ["creating", "reconciliation_required"] }, "delhivery.waybill": { $exists: false } },
      { $set: { "shiprocket.creationStatus": "creating", "shiprocket.creationAttemptedAt": new Date(), "shiprocket.creationAttemptId": new mongoose.Types.ObjectId().toString() } },
      { new: true },
    );
    if (!claimed) {
      summary.skipped += 1;
      results.push({
        orderId,
        status: "skipped",
        message: "Shipment already exists or creation is in progress",
      });
      continue;
    }
    await claimed.populate("user", "name email");
    order = claimed;

    try {
      // Reuse the single-order path so the same payment validation and
      // Shiprocket lifecycle applies to bulk actions.
      const created = await shiprocketService.createOrder(order);
      const ids = shiprocketService.extractShipment(created);
      if (!ids.orderId || !ids.shipmentId) throw new Error("Shiprocket returned no order or shipment ID");
      order.shiprocket = { orderId: String(ids.orderId), shipmentId: String(ids.shipmentId), creationStatus: "created", createdAt: new Date(), updatedAt: new Date() };
      await order.save();
      const awb = shiprocketService.extractAwb(await shiprocketService.assignAwb(ids.shipmentId));
      Object.assign(order.shiprocket, { awb: awb.awb, courier: awb.courier, trackingUrl: awb.awb ? `https://shiprocket.co/tracking/${awb.awb}` : undefined });
      if (awb.awb) {
        await shiprocketService.requestPickup(ids.shipmentId);
        order.shiprocket.pickupRequested = true;
      }
      order.status = order.shiprocket.pickupRequested ? "pickup_requested" : "ready_to_ship";
      order.statusUpdatedAt = new Date();
      await order.save();

      // Emit socket event to notify admin/frontends about status change
      try {
        if (global && global.io) {
          global.io.emit("order:status_updated", {
            orderId: order._id,
            status: order.status,
            updatedAt: order.statusUpdatedAt || new Date(),
          });
        }
      } catch (err) {
        // silent - socket may not be connected in dev
      }
      summary.created += 1;
      results.push({
        orderId,
        status: "created",
        message: "Shipment created successfully",
      });
    } catch (error) {
      await Order.updateOne({ _id: order._id, "shiprocket.orderId": { $exists: false } }, { $set: { "shiprocket.creationStatus": error.ambiguous ? "reconciliation_required" : "failed", "shiprocket.lastCreationError": error.message } });
      summary.failed += 1;
      results.push({
        orderId,
        status: "failed",
        message: error.message || "Shipment creation failed",
      });
    }
  }

  res.json({
    success: true,
    message: "Bulk shipment processing completed",
    data: {
      summary,
      results,
    },
  });
});

exports.recoverShipmentCreation = asyncHandler(async (req, res) => {
  if (req.body?.confirmNoProviderOrder !== true) {
    res.status(400);
    throw new Error("Provider order verification is required before recovery");
  }
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, "shiprocket.creationStatus": { $in: ["creating", "reconciliation_required"] }, "shiprocket.orderId": { $exists: false } },
    { $set: { "shiprocket.creationStatus": "failed", "shiprocket.lastCreationError": "Manually recovered after provider verification" }, $unset: { "shiprocket.creationLockAt": 1 } },
    { new: true },
  );
  if (!order) { res.status(409); throw new Error("Order is not in a recoverable shipment-creation state"); }
  res.json({ success: true, message: "Shipment creation state recovered", data: order });
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

  if (!order.shiprocket?.shipmentId) {
    res.status(400);
    throw new Error("Shipment must be created before requesting pickup");
  }

  if (order.shiprocket.pickupRequested) {
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

  await shiprocketService.requestPickup(order.shiprocket.shipmentId);
  order.shiprocket.pickupRequested = true;
  order.shiprocket.status = "pickup_requested";
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

  if (!order.shiprocket?.shipmentId) {
    res.status(400);
    throw new Error("Shipment must be created before downloading the label");
  }

  if (!order.shiprocket.labelUrl) {
    const label = await shiprocketService.generateLabel(order.shiprocket.shipmentId);
    order.shiprocket.labelUrl = label?.label_url || label?.labelUrl;
    if (!order.shiprocket.labelUrl) { res.status(404); throw new Error("Shipment label is not available yet"); }
    await order.save();
  }

  res.json({
    success: true,
    message: "Shipment label ready",
    data: {
      waybill: order.shiprocket.awb,
      courier: order.shiprocket.courier,
      labelUrl: order.shiprocket.labelUrl,
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

  if (order.returnShipment?.waybill) {
    return res.json({
      success: true,
      message: "Return shipment already created",
      data: order,
    });
  }

  if (order.shiprocket?.orderId) {
    const created = await shiprocketService.createReturnOrder(order);
    const ids = shiprocketService.extractShipment(created);
    if (!ids.orderId || !ids.shipmentId) throw new Error("Shiprocket returned no reverse shipment identifiers");
    const awb = shiprocketService.extractAwb(await shiprocketService.assignReturnAwb(ids.shipmentId));
    order.returnShipment = {
      provider: "shiprocket",
      orderId: String(ids.orderId),
      shipmentId: String(ids.shipmentId),
      awb: awb.awb,
      waybill: awb.awb,
      courier: awb.courier,
      trackingUrl: awb.awb ? `https://shiprocket.co/tracking/${awb.awb}` : undefined,
      status: awb.awb ? "awb_assigned" : "created",
      pickupRequested: false,
      createdAt: new Date(),
    };
    if (awb.awb) {
      await shiprocketService.requestPickup(ids.shipmentId);
      order.returnShipment.pickupRequested = true;
      order.returnShipment.status = "pickup_requested";
      try {
        const label = await shiprocketService.generateLabel(ids.shipmentId);
        order.returnShipment.labelUrl = label?.label_url || label?.labelUrl;
      } catch (error) { /* Shiprocket documents label generation as optional for returns. */ }
    }
  } else if (order.delhivery?.waybill) {
    // Historical Delhivery orders remain readable and manually operable.
    const shipment = await delhiveryService.createShipment(order);
    order.returnShipment = { provider: "delhivery", waybill: shipment.waybill, trackingUrl: shipment.trackingUrl, labelUrl: shipment.labelUrl || undefined, pickupRequested: false, createdAt: new Date() };
  } else {
    res.status(400);
    throw new Error("Original shipment must be created before arranging a return shipment");
  }

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

  if (order.returnShipment.provider === "shiprocket") {
    await shiprocketService.requestPickup(order.returnShipment.shipmentId);
    order.returnShipment.status = "pickup_requested";
  } else {
    // Historical Delhivery returns retain the old record; do not claim a new pickup was booked.
    res.status(409);
    throw new Error("Historical Delhivery return pickup requires manual carrier confirmation");
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
      const query = { _id: req.params.id };
      if (req.user?.role !== "admin") query.user = req.user?._id;
      const order = await Order.findOne(query);

      if (!order || !order.shiprocket?.awb) {
        res.status(404);

        throw new Error(
          "Shipment not found"
        );
      }

      const tracking = await shiprocketService.trackShipment(order.shiprocket.awb);
      const current = tracking?.tracking_data?.shipment_status || tracking?.shipment_status || tracking?.current_status;
      if (current) {
        order.shiprocket.status = String(current).toLowerCase();
        order.shiprocket.updatedAt = new Date();
        await order.save();
      }

      res.json({
        success: true,
        data: tracking,
      });
    }
  );
