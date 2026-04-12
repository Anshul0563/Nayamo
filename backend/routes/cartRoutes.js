const express = require("express");
const router = express.Router();

const {
  addToCart,
  updateQuantity,
  removeFromCart,
  getCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

router.post("/add", protect, addToCart);
router.put("/update", protect, updateQuantity);
router.post("/remove", protect, removeFromCart);
router.get("/", protect, getCart);

module.exports = router;