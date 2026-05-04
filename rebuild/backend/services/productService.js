const Product = require("../models/Product");
const Review = require("../models/Review");
const escapeRegex = require("../utils/escapeRegex");

class ProductService {
  async createProduct(productData) {
    const product = new Product(productData);
    await product.save();
    return product;
  }

  async getProducts(query) {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sort = "createdAt",
      jewelleryType,
      isActive = true,
    } = query;

    const filter = { isActive: isActive === "true" };

    if (category) filter.category = category;
    if (jewelleryType) filter.jewelleryType = jewelleryType;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let searchFilter = {};
    if (search) {
      const regex = new RegExp(escapeRegex(search), "gi");
      searchFilter.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
      ];
      Object.assign(filter, searchFilter);
    }

    const sortOptions = {
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      "newest": { createdAt: -1 },
      "popular": { "ratings.count": -1 },
      "rating": { "ratings.average": -1, "ratings.count": -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("ratings", "average count")
        .sort(sortBy)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
    };
  }

  async getProductById(id) {
    const product = await Product.findById(id)
      .populate("ratings", "average count");

    if (!product) return null;

    // Populate recent reviews
    product.reviews = await Review.find({ product: id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return product;
  }

  async updateProduct(id, updateData) {
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return product || null;
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    return product || null;
  }
}

module.exports = new ProductService();

