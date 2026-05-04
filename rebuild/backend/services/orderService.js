const Order = require("../models/Order");
const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

exports.createOrder = asyncHandler(async (userId, orderData) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  
  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = cart.items.map(item => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = await Order.create({
    user: userId,
    items,
    ...orderData,
    totalAmount,
  });

  // Clear cart
  await Cart.findByIdAndDelete(cart._id);

  logger.info(`Order created: ${order._id} for user ${userId}`);

  return order.populate("items.product");
});

exports.getUserOrders = asyncHandler(async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: userId })
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: userId });

  return {
    orders,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
});

exports.getOrderById = asyncHandler(async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate("items.product", "title images price");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
});

exports.cancelOrder = asyncHandler(async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new Error("Order cannot be cancelled");
  }

  order.status = "cancelled";
  order.statusUpdatedAt = new Date();
  await order.save();

  logger.info(`Order cancelled: ${orderId}`);

  return order;
});

exports.returnOrder = asyncHandler(async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "delivered") {
    throw new Error("Only delivered orders can be returned");
  }

  order.status = "returned";
  order.returnReason = reason;
  order.statusUpdatedAt = new Date();
  await order.save();

  logger.info(`Order returned: ${orderId}`);

  return order;
});

