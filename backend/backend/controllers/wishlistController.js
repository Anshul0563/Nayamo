const Wishlist = require("../models/Wishlist");

// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET WISHLIST
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    wishlist.products = wishlist.products.filter(
      item => item.toString() !== productId
    );

    await wishlist.save();

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};