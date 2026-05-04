const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

class OrderService {
  async placeOrder(userId, orderData) {
    const { shippingAddress, paymentMethod } = orderData;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart empty");
    }

    // Calculate total
    let totalAmount = 0;
    for (let item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`${item.product.title}: Insufficient stock`);
      }
      totalAmount += item.product.price * item.quantity;
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "paid" : "pending",
      totalAmount,
    });

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    // Update product stock (fire and forget)
    order.items.forEach(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    });

    await order.populate("items.product");
    return order;
  }

  async getUserOrders(userId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const filter = { user: userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    return {
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    };
  }

  async getOrderById(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.product", "title images price");

    if (!order) throw new Error("Order not found");
    return order;
  }

  async updateOrderStatus(orderId, status, adminId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    order.status = status;
    order.statusUpdatedAt = new Date();
    await order.save();

    return order;
  }

  async cancelOrder(userId, orderId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order || order.status === "cancelled") {
      throw new Error("Cannot cancel this order");
    }

    order.status = "cancelled";
    await order.save();

    // Refund stock (optional - implement business logic)
    return order;
  }
}

module.exports = new OrderService();

