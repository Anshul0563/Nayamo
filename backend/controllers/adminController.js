const orderService = require("../services/orderService");
const adminService = require("../services/adminService");

const validStatuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled"
];

// GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status
    );

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DASHBOARD
exports.getDashboardStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await adminService.getAllProducts();

    res.json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};