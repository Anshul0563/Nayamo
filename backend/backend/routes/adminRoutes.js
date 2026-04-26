const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

/* Multer Memory Storage */
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/dashboard", protect, admin, getDashboardStats);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);

router.get("/products", protect, admin, getAllProducts);

/* NEW UPLOAD ROUTE */
router.post(
  "/products/upload",
  protect,
  admin,
  upload.single("image"),
  uploadProductImage
);

router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

module.exports = router;