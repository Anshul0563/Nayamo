const cartService = require("../services/cartService");
const asyncHandler = require("../utils/asyncHandler");

// ADD TO CART
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const parsedQuantity = Number(quantity);

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    res.status(400);
    throw new Error("Quantity must be a positive integer");
  }

  const cart = await cartService.addToCart(
    req.user._id,
    productId,
    parsedQuantity,
  );
  res.json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

// UPDATE QUANTITY
exports.updateQuantity = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const parsedQuantity = Number(quantity);

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    res.status(400);
    throw new Error("Quantity must be a positive integer");
  }

  const cart = await cartService.updateQuantity(
    req.user._id,
    productId,
    parsedQuantity,
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

// REMOVE ITEM FROM CART (by product ID in body)
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

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
