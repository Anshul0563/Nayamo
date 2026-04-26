const cartService = require("../services/cartService");
const asyncHandler = require("../utils/asyncHandler");

// ADD TO CART
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const cart = await cartService.addToCart(req.user._id, productId);

  res.json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

// UPDATE QUANTITY
exports.updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await cartService.updateQuantity(
    req.user._id,
    productId,
    Number(quantity)
  );

  res.json({
    success: true,
    message: "Cart updated",
    data: cart,
  });
});

// GET CART
exports.getCart = asyncHandler(async (req, res) => {
  const data = await cartService.getCart(req.user._id);

  res.json({
    success: true,
    data,
  });
});

// DELETE CART ITEM (by product ID in URL)
exports.deleteCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const cart = await cartService.removeFromCart(req.user._id, productId);

  res.json({
    success: true,
    message: "Item removed from cart",
    data: cart,
  });
});
