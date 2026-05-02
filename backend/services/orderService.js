const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const { emitOrderNotification, emitInventoryNotification } = require("./notificationService");

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

    // Create order with idempotency key (unique index handles race conditions)
    let order;
    try {
      [order] = await Order.create(
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
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.idempotencyKey) {
        // Duplicate idempotency key - return existing order
        await session.abortTransaction();
        session.endSession();
        logger.info(`Duplicate order prevented for idempotencyKey: ${idempotencyKey}`);
        return Order.findOne({ idempotencyKey }).lean();
      }
      throw err;
    }

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    logger.info(`Order placed: ${order._id} by user ${userId}`);
    emitOrderNotification(order, "new").catch((err) =>
      logger.error("Order notification failed:", err.message)
    );

    return order;
  } catch (error) {
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
      })
      .lean(),
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    // Can only cancel if status is pending or confirmed
    if (!["pending", "confirmed"].includes(order.status)) {
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

    logger.info(`Order cancelled: ${order._id} by user ${userId}`);
    emitOrderNotification(order, "cancelled").catch((err) =>
      logger.error("Order cancel notification failed:", err.message)
    );

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// USER - Return Order
exports.returnOrder = async (userId, orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    // Return is only allowed for delivered orders
    if (order.status !== "delivered") {
      throw new Error("Can only return delivered orders");
    }

    // Check if return is within 7 days
    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));

    if (daysSinceDelivery > 7) {
      throw new Error("Return period of 7 days has expired");
    }

    // Update status to return_requested first
    order.status = "return_requested";
    await order.save({ session });

    await session.commitTransaction();

    logger.info(`Return requested for order: ${order._id} by user ${userId}`);
    emitOrderNotification(order, "return_requested").catch((err) =>
      logger.error("Return notification failed:", err.message)
    );

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
    const escapeRegex = require("../utils/escapeRegex");
    const safeSearch = escapeRegex(search);
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
      })
      .lean(),
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

  const order = await Order.findByIdAndUpdate(orderId, updateData, {
    new: true,
    runValidators: true,
  }).populate("items.product", "title stock");

  if (order) {
    const eventType = status === "in_transit" ? "shipped" : status;
    emitOrderNotification(order, eventType).catch((err) =>
      logger.error("Order status notification failed:", err.message)
    );

    for (const item of order.items || []) {
      const product = item.product;
      if (!product) continue;
      if (Number(product.stock) === 0) {
        emitInventoryNotification(product, "out_of_stock").catch((err) =>
          logger.error("Inventory notification failed:", err.message)
        );
      } else if (Number(product.stock) <= 5) {
        emitInventoryNotification(product, "low_stock").catch((err) =>
          logger.error("Inventory notification failed:", err.message)
        );
      }
    }
  }

  return order;
};
