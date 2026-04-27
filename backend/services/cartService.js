const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD TO CART
exports.addToCart = async (userId, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Validate product exists and is active
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new Error("Product not found or not available");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Check stock before incrementing
    const newQuantity = cart.items[itemIndex].quantity + 1;
    if (product.stock < newQuantity) {
      throw new Error(`Only ${product.stock} items available in stock`);
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    if (product.stock < 1) {
      throw new Error("Product is out of stock");
    }
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  return cart;
};

// UPDATE QUANTITY
exports.updateQuantity = async (userId, productId, quantity) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!quantity || quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Validate product stock
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new Error("Product not found or not available");
  }

  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new Error("Item not found in cart");
  }

  item.quantity = quantity;

  await cart.save();
  return cart;
};

// REMOVE ITEM
exports.removeFromCart = async (userId, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new Error("Item not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

// GET CART (WITH TOTAL)
exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "title price images stock category isActive",
    });

  if (!cart || cart.items.length === 0) {
    return {
      cart: { user: userId, items: [] },
      total: 0,
      itemCount: 0,
    };
  }

  let total = 0;
  let itemCount = 0;

  // Filter out inactive products and calculate totals
  const validItems = cart.items.filter((item) => {
    if (!item.product || !item.product.isActive) return false;
    total += item.product.price * item.quantity;
    itemCount += item.quantity;
    return true;
  });

  return {
    cart: {
      ...cart.toObject(),
      items: validItems,
    },
    total,
    itemCount,
  };
};
