const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

// ADD PRODUCT
exports.createProduct = asyncHandler(async (req, res) => {
  const { title, price, category, stock, description } = req.body;

  // Validation
  if (!title || !price || !category) {
    res.status(400);
    throw new Error("Title, price, and category are required");
  }

  if (!["gold", "silver", "diamond"].includes(category)) {
    res.status(400);
    throw new Error("Category must be gold, silver, or diamond");
  }

  if (price < 0) {
    res.status(400);
    throw new Error("Price cannot be negative");
  }

  let images = [];

  // Upload images to Cloudinary from memory buffer
  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(fileStr, {
        folder: "nayamo-products",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      images.push(result.secure_url);
    }
  }

  const product = await productService.createProduct({
    title: title.trim(),
    description: description ? description.trim() : "",
    price: Number(price),
    category,
    stock: stock ? Number(stock) : 0,
    images,
  });

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
