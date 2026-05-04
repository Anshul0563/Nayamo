const asyncHandler = require("../utils/asyncHandler");
const wishlistService = require("../services/wishlistService");

exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  res.json({
    success: true,
    data: wishlist,
  });
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.addToWishlist(req.user._id, productId);
  res.json({
    success: true,
    message: "Added to wishlist",
    data: wishlist,
  });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, productId);
  res.json({
    success: true,
    message: "Removed from wishlist",
    data: wishlist,
  });
});

