const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");

exports.createProduct = asyncHandler(async (req, res) => {
  let images = [];

  // Upload images
  if (req.files && req.files.length > 0) {
    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.buffer.toString("base64"), {
        resource_type: "auto",
        folder: "nayamo/products",
      });
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
  }

  const productData = { ...req.body, images };
  const product = await productService.createProduct(productData);

  res.status(201).json({
    success: true,
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({
    success: true,
    data: product,
  });
});

