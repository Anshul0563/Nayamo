const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  generateWaybill,
  createShipment,
  trackShipment,
  cancelShipment
} = require("../controllers/delhiveryController");

router.get("/waybill", protect, admin, generateWaybill);
router.post("/create", protect, admin, createShipment);
router.get("/track/:waybill", protect, admin, trackShipment);
router.post("/cancel", protect, admin, cancelShipment);

module.exports = router;
