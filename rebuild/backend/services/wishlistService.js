const Wishlist = require("../models/Wishlist");

class WishlistService {
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [] });
      await wishlist.save();
    }
    return wishlist.populate("products");
  }

  async addToWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return await this.createWishlist(userId, productId);
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    return wishlist.populate("products");
  }

  async removeFromWishlist(userId, productId) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new Error("Wishlist not found");

    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();

    return wishlist.populate("products");
  }

  async createWishlist(userId, productId) {
    const wishlist = new Wishlist({ 
      user: userId, 
      products: [productId] 
    });
    await wishlist.save();
    return wishlist.populate("products");
  }
}

module.exports = new WishlistService();

