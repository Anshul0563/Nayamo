const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ADD TO CART
exports.addToCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  return cart;
};

// UPDATE QUANTITY
exports.updateQuantity = async (userId, productId, quantity) => {
  const cart = await Cart.findOne({ user: userId });

  const item = cart.items.find(
    item => item.product.toString() === productId
  );

  if (item) {
    item.quantity = quantity;
  }

  await cart.save();
  return cart;
};

// REMOVE ITEM
exports.removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

// GET CART (WITH TOTAL)
exports.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.product");

  if (!cart) return null;

  let total = 0;

  cart.items.forEach(item => {
    total += item.product.price * item.quantity;
  });

  return { cart, total };
};