const express = require("express");
const router = express.Router();

const { getPaymentOptions } = require("../controllers/settingsController");

router.get("/payment-options", getPaymentOptions);

module.exports = router;
