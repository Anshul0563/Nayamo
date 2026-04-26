const express = require("express");
const router = express.Router();

const {
  generateWaybill,
  createShipment,
  trackShipment,
  cancelShipment
} = require("../controllers/delhiveryController");

router.get("/waybill", generateWaybill);
router.post("/create", createShipment);
router.get("/track/:waybill", trackShipment);
router.post("/cancel", cancelShipment);

module.exports = router;