const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// LIVE Dashboard Stats with date range support
exports.getDashboardStats = async ({ dateFrom, dateTo }) => {
  const match = {
    createdAt: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo)
    }
  };

  const deliveredStatuses = ['delivered', 'confirmed'];
  
  const [totalOrders, totalUsers, totalProducts, totalRevenueAgg, statusBreakdown] = await Promise.all([
    Order.countDocuments(match),
    User.countDocuments({ createdAt: match.createdAt }),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { 
        $match: { 
          ...match, 
          status: { $in: deliveredStatuses }, 
          paymentStatus: 'paid' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenueAgg[0]?.total / totalOrders) : 0,
    statusBreakdown,
    ordersByStatus: statusBreakdown.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
  };
};

// Revenue chart data (30 days)
exports.getRevenueChartData = async ({ days = 30 }) => {
  const endDate = new Date();
  const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);

  const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'confirmed'] },
        paymentStatus: 'paid',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    { $limit: 30 }
  ]);

  return revenueData.map(item => ({
    date: `${item._id.month.toString().padStart(2, '0')}/${item._id.day.toString().padStart(2, '0')}`,
    revenue: item.revenue,
    orders: item.orders
  }));
};

// Recent orders
exports.getRecentOrders = async (limit = 5) => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email phone')
    .select('-items')
    .lean();
};

// Top products
exports.getTopProducts = async (limit = 5) => {
  return await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        sales: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { sales: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
        pipeline: [{ $project: { title: 1, images: 1, price: 1 } }]
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
  ]);
};

// Conversion funnel
exports.getConversionFunnel = async () => {
  const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });
  return [
    { stage: 'Visitors', value: 12500 },
    { stage: 'Added to Cart', value: 3240 },
    { stage: 'Checkout', value: 1560 },
    { stage: 'Purchased', value: paidOrders }
  ];
};

// Users list with search/pagination
exports.getAllUsers = async ({ page = 1, limit = 20, search }) => {
  const skip = (page - 1) * limit;
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ]
  } : {};

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query)
  ]);

  return {
    users,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit)
  };
};

// Products list with search/pagination
exports.getAllProducts = async ({ page = 1, limit = 20, search, category }) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  if (category) query.category = category;

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  return {
    products,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit)
  };
};

// Update product
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
};

// Delete product
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

