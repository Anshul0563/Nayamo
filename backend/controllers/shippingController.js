
const Order = require("../models/Order");
const {
  createShipment,
  getLabel,
} = require("../services/shiprocketService");

// CREATE SHIPMENT FOR ORDER
exports.createShipmentOrder = async (
  req,
  res
) => {
  try {
    const order =
      await Order.findById(
        req.params.id
      )
        .populate("user")
        .populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const data =
      await createShipment(order);

    // Shiprocket useful data
    const shipmentId =
      data.shipment_id ||
      data.shipment_id?.[0];

    const awb =
      data.awb_code ||
      data.awb_code?.[0] ||
      "";

    // Save in DB (dynamic fields)
    order.shiprocket = {
      shipmentId,
      awb,
      createdAt: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      message:
        "Shipment created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
};

// DOWNLOAD LABEL
exports.downloadLabel =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (
        !order ||
        !order.shiprocket
          ?.shipmentId
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Shipment not found",
          });
      }

      const data =
        await getLabel(
          order.shiprocket
            .shipmentId
        );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };
