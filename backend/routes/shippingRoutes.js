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
  "/track/:id",
  protect,
  trackShipment
);

module.exports =
  router;
