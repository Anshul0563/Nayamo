const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");

exports.createProduct = asyncHandler(async (productData) => {
  const product = await Product.create(productData);
  return product;
});

exports.getProducts = asyncHandler(async (query) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    price,
    sort = "createdAt",
    order = "desc",
  } = query;

  const filter = { isActive: true };
  
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (price) {
    const [min, max] = price.split(",").map(Number);
    filter.price = { $gte: min || 0, $lte: max || Infinity };
  }

  const skip = (page - 1) * limit;
  const sortObj = { [sort]: order === "desc" ? -1 : 1 };

  const products = await Product.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("ratings");

  const total = await Product.countDocuments(filter);

  return {
    products,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: parseInt(limit),
  };
});

exports.getProductById = asyncHandler(async (id) => {
  const product = await Product.findById(id).populate("ratings");
  if (!product || !product.isActive) {
    throw new Error("Product not found");
  }
  return product;
});

