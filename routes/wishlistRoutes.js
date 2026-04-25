const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

router.post("/add", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.post("/remove", protect, removeFromWishlist);

module.exports = router;