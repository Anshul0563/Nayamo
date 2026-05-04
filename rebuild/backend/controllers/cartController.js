const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cartService");
const logger = require("../config/logger");

exports.getCart = asyncHandler(async (req, res) => {
  const cartData = await cartService.getCart(req.user._id);
  res.json({
    success: true,
    data: cartData,
  });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const cart = await cartService.addToCart(req.user._id, productId);
  res.json({
    success: true,
    message: "Added to cart",
    data: cart,
  });
});

exports.updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.updateQuantity(req.user._id, productId, quantity);
  res.json({
    success: true,
    data: cart,
  });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const cart = await cartService.removeFromCart(req.user._id, productId);
  res.json({
    success: true,
    message: "Removed from cart",
    data: cart,
  });
});

