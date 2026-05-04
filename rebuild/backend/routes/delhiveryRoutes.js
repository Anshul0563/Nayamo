const express = require("express");
const router = express.Router();

const delhiveryController = require("../controllers/delhiveryController");

router.post("/create-shipment", delhiveryController.createShipment);

module.exports = router;

