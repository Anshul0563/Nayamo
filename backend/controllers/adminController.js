const orderService = require("../services/orderService");
const adminService = require("../services/adminService");

const validStatuses = [
  "pending",
  "confirmed",
  "packed",
  "ready_to_ship",
  "pickup_requested",
  "in_transit",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "rto",
];

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status
    );

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DASHBOARD
exports.getDashboardStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await adminService.getAllProducts();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const product = await adminService.updateProduct(
      req.params.id,
      req.body
    );
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    await adminService.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/* PRODUCT IMAGE UPLOAD */
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: "nayamo-products",
    });

    res.status(200).json({
      url: result.secure_url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Image upload failed",
    });
  }
};