const orderService = require("../services/orderService");
const adminService = require("../services/adminService");

// VALID STATUSES
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
      count: orders.length,
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

    // status validation
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status ❌"
      });
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status
    );

    // order exist check
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found ❌"
      });
    }

    res.json({
      success: true,
      message: "Order status updated 💎",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
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