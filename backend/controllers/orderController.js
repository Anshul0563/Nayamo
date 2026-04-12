const orderService = require("../services/orderService");

// PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const order = await orderService.placeOrder(
      req.user._id,
      req.body
    );

    res.status(201).json(order);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// USER ORDERS
exports.getOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);
    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};