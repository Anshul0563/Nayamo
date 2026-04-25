const Cart = require("../models/Cart");
const cartService = require("../services/cartService");

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const cart = await cartService.addToCart(
      req.user._id,
      req.body.productId
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const cart = await cartService.updateQuantity(
      req.user._id,
      req.body.productId,
      req.body.quantity
    );

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const data = await cartService.getCart(req.user._id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE ITEM FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.id
    );

    await cart.save();

    res.json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};