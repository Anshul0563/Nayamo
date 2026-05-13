const Order = require("../models/Order");

const delhiveryService =
  require("../services/delhiveryService");

const asyncHandler =
  require("../utils/asyncHandler");

// =========================
// CREATE SHIPMENT
// =========================
exports.createShipment =
  asyncHandler(
    async (req, res) => {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        res.status(404);

        throw new Error(
          "Order not found"
        );
      }

      // Already shipped
      if (
        order.delhivery
          ?.waybill
      ) {
        return res.json({
          success: true,
          message:
            "Shipment already created",
          data: order,
        });
      }

      const shipment =
        await delhiveryService.createShipment(
          order
        );

      order.delhivery = {
        waybill:
          shipment.waybill,

        trackingUrl:
          shipment.trackingUrl,

        createdAt:
          new Date(),
      };

      order.status =
        "confirmed";

      await order.save();

      res.json({
        success: true,
        message:
          "Shipment created successfully",
        data: order,
      });
    }
  );

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