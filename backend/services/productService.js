const Product = require("../models/Product");

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
    page = 1
  } = queryParams;

  const limit = 6;

  let query = {
    title: { $regex: search, $options: "i" }
  };

  if (category) query.category = category;

  if (min || max) {
    query.price = {};
    if (min) query.price.$gte = Number(min);
    if (max) query.price.$lte = Number(max);
  }

  let sortOption = {};
  if (sort === "low") sortOption.price = 1;
  if (sort === "high") sortOption.price = -1;

  const products = await Product.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  return products;
};