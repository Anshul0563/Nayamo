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

router.get(
  "/track/:id",
  protect,
  trackShipment
);

module.exports =
  router;