const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");
const { uploadBufferToCloudinary } = require("../utils/cloudinaryUpload");
const asyncHandler = require("../utils/asyncHandler");
const logger = require("../config/logger");
const { CATEGORIES, JEWELLERY_TYPES } = require("../constants/catalog");

// ADD PRODUCT
exports.createProduct = asyncHandler(async (req, res) => {
  const { title, price, category, jewelleryType, stock, description } = req.body;

  // Validation
  if (!title || !price || !category) {
    res.status(400);
    throw new Error("Title, price, and category are required");
  }

  if (!CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error("Category must be party, daily, traditional, western, statement, or bridal");
  }

  if (
    jewelleryType &&
    !JEWELLERY_TYPES.includes(jewelleryType)
  ) {
    res.status(400);
    throw new Error("Invalid jewellery type");
  }

  if (price < 0) {
    res.status(400);
    throw new Error("Price cannot be negative");
  }

  let images = [];

  // Upload images to Cloudinary from memory buffer
  if (req.files?.length) {
    try {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "nayamo-products",
          mimetype: file.mimetype,
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        });
        images.push({ url: result.url, publicId: result.publicId });
      }
    } catch (error) {
      await Promise.allSettled(
        images.map(({ publicId }) => cloudinary.uploader.destroy(publicId)),
      );
      throw error;
    }
  } else if (Array.isArray(req.body.images)) {
    images = req.body.images.map((image) =>
      typeof image === "string" ? { url: image, publicId: "" } : image
    );
  }

  const product = await productService.createProduct({
    title: title.trim(),
    description: description ? description.trim() : "",
    price: Number(price),
    category,
    jewelleryType,
    stock: stock ? Number(stock) : 0,
    images,

    isActive: true,
  });

  logger.info(`Product created: ${product._id}`);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// GET PRODUCTS
exports.getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);

  res.json({
    success: true,
    data: result.products,
    pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
    },
  });
});

// GET SINGLE PRODUCT
exports.getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    data: product,
  });
});
