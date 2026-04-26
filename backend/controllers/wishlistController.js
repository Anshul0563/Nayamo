const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

// ADD TO WISHLIST
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID format");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }

  // Check if product already in wishlist
  const productExists = wishlist.products.some(
    (id) => id.toString() === productId
  );

  if (!productExists) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  // Populate and return
  wishlist = await Wishlist.findById(wishlist._id).populate("products");

  res.json({
    success: true,
    message: "Added to wishlist",
    data: wishlist,
  });
});

// GET WISHLIST
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products"
  );

  res.json({
    success: true,
    data: wishlist || { user: req.user._id, products: [] },
  });
});

// REMOVE FROM WISHLIST
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.toString() !== productId
  );

  await wishlist.save();

  res.json({
    success: true,
    message: "Removed from wishlist",
    data: wishlist,
  });
});
