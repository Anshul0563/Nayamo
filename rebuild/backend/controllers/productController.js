const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/productService");
const { uploadImage } = require("../config/cloudinary");
const logger = require("../config/logger");

exports.createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, stock, jewelleryType, material, color, finish, occasion, style, originalPrice } = req.body;

  // Validation (already done by middleware, extra safety)
  if (!title || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "Title, price, and category required",
    });
  }

  let images = [];

  // Upload images
  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      const image = await uploadImage(file.buffer, "nayamo-products");
      images.push(image);
    }
  }

  const productData = {
    title: title.trim(),
    description: description?.trim() || "",
    price: Number(price),
    category,
    jewelleryType: jewelleryType || "earrings",
    stock: Number(stock) || 0,
    images,
    material: material?.trim(),
    color: color?.trim(),
    finish: finish?.trim(),
    occasion: occasion?.trim(),
    style: style?.trim(),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    isActive: true,
  };

  const product = await productService.createProduct(productData);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({
    success: true,
    ...result,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.json({
    success: true,
    data: product,
  });
});

