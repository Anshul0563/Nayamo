const Product = require("../models/Product");
const mongoose = require("mongoose");

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.createProduct = async (data) => {
  return await Product.create(data);
};

exports.getProducts = async (queryParams) => {
  const {
    search = "",
    category,
    min,
    max,
    sort,
    page = 1,
  } = queryParams;

  const limit = 6;

  let query = {};

  // Sanitized search with regex
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (category) query.category = category;

  if (min || max) {
    query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);
  }

  let sortOption = {};
  if (sort === "low") sortOption.price = 1;
  if (sort === "high") sortOption.price = -1;
  if (sort === "newest") sortOption.createdAt = -1;
  if (sort === "oldest") sortOption.createdAt = 1;

  // Only show active products for public
  query.isActive = true;

  const skip = (Number(page) - 1) * limit;

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
};

exports.getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID format");
  }
  return await Product.findById(id);
};
