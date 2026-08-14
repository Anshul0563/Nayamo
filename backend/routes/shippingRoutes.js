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
  createReturnShipment,
  requestReturnPickup,
  getReturnLabel,
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

router.post(
  "/return/create/:id",
  protect,
  admin,
  createReturnShipment
);

router.post(
  "/return/request-pickup/:id",
  protect,
  admin,
  requestReturnPickup
);

router.get(
  "/return/label/:id",
  protect,
  admin,
  getReturnLabel
);

router.get(
  "/track/:id",
  protect,
  trackShipment
);

module.exports =
  router;
