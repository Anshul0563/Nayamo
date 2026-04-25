const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// PLACE ORDER
exports.placeOrder = async (userId, data) => {
  const { address, phone, paymentMethod } = data;

  if (!address || !phone) {
    throw new Error("Address and phone required");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let total = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.title} out of stock`);
    }

    product.stock -= item.quantity;
    await product.save();

    total += product.price * item.quantity;
  }

  const order = await Order.create({
    user: userId,
    items: cart.items,
    totalPrice: total,
    address,
    phone,
    paymentMethod
  });

  cart.items = [];
  await cart.save();

  return order;
};

// USER ORDERS
exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("items.product");
};

// GET SINGLE ORDER
exports.getSingleOrder = async (userId, orderId) => {
  return await Order.findOne({
    _id: orderId,
    user: userId
  }).populate("items.product");
};

// CANCEL ORDER
exports.cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) throw new Error("Order not found");

  if (["shipped", "delivered"].includes(order.status)) {
    throw new Error("Cannot cancel now");
  }

  order.status = "cancelled";
  await order.save();

  return order;
};

// ADMIN
exports.getAllOrders = async () => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("items.product");
};

exports.updateOrderStatus = async (orderId, status) => {
  return await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};