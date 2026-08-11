const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const escapeRegex = require("../utils/escapeRegex");
const redis = require("../config/redis");
const logger = require("../config/logger");

const CACHE_TTL = 300; // 5 minutes
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 60;

const normalizePositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const normalizeSort = (sort) => {
  const sortMap = {
    low: { price: 1 },
    high: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "rating-desc": { "ratings.average": -1, "ratings.count": -1 },
    "best-seller": { __bestSeller: -1 },
    "-createdAt": { createdAt: -1 },
  };

  return sortMap[sort] || { createdAt: -1 };
};

exports.createProduct = async (data) => {
  const product = await Product.create(data);

  if (redis) {
    await exports.invalidateProductCache();
  }

  logger.info(`Product created: ${product._id}`);
  return product;
};

// Aggregates real order data to compute a best-seller ranking for products.
const getBestSellerRanking = async () => {
  try {
    const ranking = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" }, isArchived: { $ne: true } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { soldCount: -1 } },
    ]);

    return ranking.reduce((acc, item) => {
      acc[String(item._id)] = item.soldCount;
      return acc;
    }, {});
  } catch (err) {
    logger.warn("Best-seller aggregation failed:", err.message);
    return {};
  }
};

exports.getProducts = async (queryParams) => {
  const {
    search = "",
    category,
    jewelleryType,
    rating,
    min,
    max,
    priceMin,
    priceMax,
    sort,
    page = 1,
    limit,
  } = queryParams;

  const currentPage = normalizePositiveNumber(page, 1);
  const perPage = Math.min(normalizePositiveNumber(limit, DEFAULT_LIMIT), MAX_LIMIT);
  const minPrice = min ?? priceMin;
  const maxPrice = max ?? priceMax;

  const normalizedCategory = category
    ? String(category).trim().toLowerCase()
    : undefined;
  const normalizedJewelleryType =
    jewelleryType || queryParams.jewellerytype
      ? String(jewelleryType || queryParams.jewellerytype).trim().toLowerCase()
      : undefined;

  let query = {};

  // Sanitized search with regex
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (normalizedCategory) query.category = normalizedCategory;

  if (normalizedJewelleryType) query.jewelleryType = normalizedJewelleryType;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (rating) {
    query["ratings.average"] = { $gte: Number(rating) };
  }

  // Only show active products for public
  query.isActive = true;

  const skip = (currentPage - 1) * perPage;

  // Cache key
  const cacheKey = `products:list:${JSON.stringify({
    search,
    category,
    jewelleryType,
    rating,
    min: minPrice,
    max: maxPrice,
    sort,
    page: currentPage,
    limit: perPage,
  })}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.warn("Redis cache read failed:", err.message);
    }
  }

  const sortOption = normalizeSort(sort);

  // Best-seller needs real order-based ranking, not fake data.
  let bestSellerRank = null;
  if (sort === "best-seller") {
    bestSellerRank = await getBestSellerRanking();
  }

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(perPage)
      .lean(),
    Product.countDocuments(query),
  ]);

  // Apply best-seller ranking to the already-fetched page (stable, real order data).
  if (bestSellerRank) {
    products.sort((a, b) => {
      const rankA = bestSellerRank[String(a._id)] || 0;
      const rankB = bestSellerRank[String(b._id)] || 0;
      return rankB - rankA;
    });
  }

  const result = {
    products,
    currentPage,
    totalPages: Math.max(Math.ceil(totalItems / perPage), 1),
    totalItems,
    itemsPerPage: perPage,
  };

  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (err) {
      logger.warn("Redis cache write failed:", err.message);
    }
  }

  return result;
};

exports.getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID format");
  }

  const cacheKey = `products:${id}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      logger.warn("Redis cache read failed:", err.message);
    }
  }

  const product = await Product.findOne({ _id: id, isActive: true }).lean();

  if (product && redis) {
    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(product));
    } catch (err) {
      logger.warn("Redis cache write failed:", err.message);
    }
  }

  return product;
};

exports.invalidateProductCache = async () => {
  if (!redis) return;

  try {
    const keys = await redis.keys("products:list:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    const productKeys = await redis.keys("products:*");
    if (productKeys.length > 0) {
      await redis.del(...productKeys);
    }
  } catch (err) {
    logger.warn("Cache invalidation failed:", err.message);
  }
};
