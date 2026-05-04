const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");

exports.addToWishlist = asyncHandler(async (userId, productId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  logger.info(`Product ${productId} added to wishlist for user ${userId}`);
  
  return wishlist.populate("products", "title images price");
});

exports.removeFromWishlist = asyncHandler(async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ user: userId });
  
  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
  await wishlist.save();

  logger.info(`Product ${productId} removed from wishlist for user ${userId}`);
  
  return wishlist.populate("products", "title images price");
});

exports.getWishlist = asyncHandler(async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate("products", "title images price ratings category");
  
  return wishlist || { products: [] };
});

