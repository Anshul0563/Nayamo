const cartService = require("../services/cartService");

// ADD
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

// UPDATE
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

// REMOVE
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await cartService.removeFromCart(
      req.user._id,
      req.body.productId
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