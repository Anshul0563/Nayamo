const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// PLACE ORDER (with transaction)
exports.placeOrder = async (userId, data) => {
  const { address, phone, paymentMethod, idempotencyKey } = data;

  if (!address || !phone) {
    throw new Error("Address and phone required");
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Validate all products have sufficient stock before starting transaction
  for (const item of cart.items) {
    if (!item.product) {
      throw new Error("Product not found in cart");
    }
    if (!item.product.isActive) {
      throw new Error(`${item.product.title} is no longer available`);
    }
    if (item.product.stock < item.quantity) {
      throw new Error(`Only ${item.product.stock} units of ${item.product.title} available`);
    }
  }

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for duplicate order using idempotency key INSIDE transaction
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey }).session(session).lean();
      if (existingOrder) {
        await session.commitTransaction();
        return existingOrder;
      }
    }

    let total = 0;
    const orderItems = [];

    // Deduct stock for each item
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);

      product.stock -= item.quantity;
      await product.save({ session });

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: product.price,
      });

      total += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          totalPrice: total,
          address: address.trim(),
          phone,
          paymentMethod: paymentMethod || "cod",
          idempotencyKey: idempotencyKey || null,
        },
      ],
      { session }
    );

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return order[0]; // create with array returns array

  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// USER ORDERS with pagination
exports.getUserOrders = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [orders, totalItems] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "items.product",
        select: "title price images category",
      }),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
};

// GET SINGLE ORDER
exports.getSingleOrder = async (userId, orderId) => {
  return await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate({
    path: "items.product",
    select: "title price images category",
  });
};

// CANCEL ORDER (with stock restore)
exports.cancelOrder = async (userId, orderId) => {
  // Start transaction first
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch order INSIDE transaction to prevent race conditions
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    if (order.isPaid) {
      throw new Error("Cannot cancel paid order. Please request a refund instead.");
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save({ session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ADMIN - Get all orders with pagination
exports.getAllOrders = async ({ page = 1, limit = 20, status, search }) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (status) query.status = status;
  if (search) {
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { address: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "title price images",
      }),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
};

// ADMIN - Update order status
exports.updateOrderStatus = async (orderId, status) => {
  const updateData = { status };

  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  }

  return await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  });
};
