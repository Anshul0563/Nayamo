const Product = require("../models/Product");
const mongoose = require("mongoose");
const escapeRegex = require("../utils/escapeRegex");
const redis = require("../config/redis");
const logger = require("../config/logger");

const CACHE_TTL = 300; // 5 minutes

exports.createProduct = async (data) => {
  const product = await Product.create(data);
  // Invalidate product cache
  await redis.del("products:list:*");
  logger.info(`Product created: ${product._id}`);
  return product;
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

  // Cache key
  const cacheKey = `products:list:${JSON.stringify({ search, category, min, max, sort, page })}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn("Redis cache read failed:", err.message);
  }

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  const result = {
    products,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };

  try {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  } catch (err) {
    logger.warn("Redis cache write failed:", err.message);
  }

  return result;
};

exports.getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID format");
  }

  const cacheKey = `products:${id}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn("Redis cache read failed:", err.message);
  }

  const product = await Product.findOne({ _id: id, isActive: true }).lean();

  if (product) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
    } catch (err) {
      logger.warn("Redis cache write failed:", err.message);
    }
  }

  return product;
};

exports.invalidateProductCache = async () => {
  try {
    const keys = await redis.keys("products:list:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    await redis.del("products:*");
  } catch (err) {
    logger.warn("Cache invalidation failed:", err.message);
  }
};
