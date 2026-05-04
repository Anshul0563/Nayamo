const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/orderService");
const logger = require("../config/logger");

exports.createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  
  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id, req.query);
  
  res.json({
    success: true,
    data: orders.orders,
    pagination: orders.pagination,
  });
});

exports.getOrderDetails = asyncHandler(async (req, res) => {
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
    message: "Order cancelled successfully",
    data: order,
  });
});

exports.returnOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await orderService.returnOrder(req.user._id, req.params.id, reason);
  
  res.json({
    success: true,
    message: "Return request submitted",
    data: order,
  });
});

