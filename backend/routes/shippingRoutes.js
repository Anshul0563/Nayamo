const express =
  require("express");

const router =
  express.Router();

const protect =
  require("../middleware/authMiddleware");

const admin =
  require("../middleware/adminMiddleware");

const {
  createShipment,
  requestPickup,
  getShipmentLabel,
  trackShipment,
} = require(
  "../controllers/shippingController"
);

router.post(
  "/create/:id",
  protect,
  admin,
  createShipment
);

router.post(
  "/request-pickup/:id",
  protect,
  admin,
  requestPickup
);

router.get(
  "/label/:id",
  protect,
  admin,
  getShipmentLabel
);

router.get(
  "/track/:id",
  protect,
  trackShipment
);

module.exports =
  router;
