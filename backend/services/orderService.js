const Order = require("../models/Order");
const Cart = require("../models/Cart");

// PLACE ORDER
exports.placeOrder = async (userId, data) => {
  const { address, phone, paymentMethod } = data;

  const cart = await Cart.findOne({ user: userId })
    .populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty ❌");
  }

  let total = 0;

  cart.items.forEach(item => {
    total += item.product.price * item.quantity;
  });

  const order = await Order.create({
    user: userId,
    items: cart.items,
    totalPrice: total,
    address,
    phone,
    paymentMethod
  });

  // clear cart
  cart.items = [];
  await cart.save();

  return order;
};

// USER ORDERS
exports.getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .populate("items.product");
};

// ADMIN: GET ALL ORDERS
exports.getAllOrders = async () => {
  return await Order.find()
    .populate("user")
    .populate("items.product");
};

// ADMIN: UPDATE STATUS
exports.updateOrderStatus = async (orderId, status) => {
  return await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );
};