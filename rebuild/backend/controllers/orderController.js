const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/orderService");
const logger = require("../config/logger");
const Cart = require("../models/Cart");

exports.placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id, req.query);
  res.json({
    success: true,
    data: orders,
  });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user._id, req.params.id);
  res.json({
    success: true,
    data: order,
  });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user._id, req.params.id);
  res.json({
    success: true,
    message: "Order cancelled",
    data: order,
  });
});

