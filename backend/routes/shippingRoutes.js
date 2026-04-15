const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  createShipmentOrder,
  downloadLabel,
} = require("../controllers/shippingController");

// Create Shipment
router.post(
  "/create/:id",
  protect,
  admin,
  createShipmentOrder
);

// Download Label
router.get(
  "/label/:id",
  protect,
  admin,
  downloadLabel
);

module.exports = router;