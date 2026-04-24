const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");

// ADD PRODUCT
exports.createProduct = async (req, res) => {
  try {
    let images = [];

    if (req.files) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
      }
    }

    const product = await productService.createProduct({
      ...req.body,
      images
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};