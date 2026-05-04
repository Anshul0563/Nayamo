const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

router.use(adminController.protect);

router.get("/dashboard", adminController.dashboardStats);
router.get("/orders", adminController.getAllOrders);
router.get("/users", adminController.getAllUsers);

module.exports = router;

