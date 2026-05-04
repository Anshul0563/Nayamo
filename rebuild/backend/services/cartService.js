const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartService {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    // Calculate totals
    let totalItems = 0;
    let totalAmount = 0;

    for (let item of cart.items) {
      totalItems += item.quantity;
      totalAmount += item.product.price * item.quantity;
    }

    return {
      cart,
      itemCount: totalItems,
      total: totalAmount,
    };
  }

  async addToCart(userId, productId) {
    const product = await Product.findById(productId);
    if (!product || product.stock === 0) {
      throw new Error("Product unavailable");
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId });
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save().populate("items.product");
    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!item) throw new Error("Item not in cart");

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} available`);
    }

    item.quantity = quantity;
    await cart.save().populate("items.product");
    return cart;
  }

  async removeFromCart(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save().populate("items.product");
    return cart;
  }

  async clearCart(userId) {
    await Cart.findOneAndDelete({ user: userId });
  }
}

module.exports = new CartService();

