const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing products");

    const products = [
      {
        title: "Royal Diamond Studs",
        description: "Premium diamond earrings for special occasions",
        price: 25000,
        category: "bridal",
        stock: 5,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.8, count: 23 }
      },
      {
        title: "Golden Hoops",
        description: "Classic 22k gold hoop earrings",
        price: 8500,
        category: "party",
        stock: 12,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.2, count: 15 }
      },
      {
        title: "Pearl Drops",
        description: "Elegant pearl drop earrings for daily wear",
        price: 3200,
        category: "daily",
        stock: 8,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.9, count: 28 }
      },
      {
        title: "Statement Chandbalis",
        description: "Traditional chandbali earrings with kundan work",
        price: 18000,
        category: "traditional",
        stock: 3,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.5, count: 17 }
      },
      {
        title: "Western Jhumkas",
        description: "Modern fusion jhumkas with contemporary design",
        price: 6500,
        category: "western",
        stock: 10,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.5, count: 12 }
      },
      {
        title: "Bold Statement Rings Earrings",
        description: "Oversized geometric earrings for bold looks",
        price: 12000,
        category: "statement",
        stock: 6,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.1, count: 9 }
      },
      {
        title: "Simple Silver Studs",
        description: "Minimalist silver studs for everyday elegance",
        price: 1200,
        category: "daily",
        stock: 20,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 2.8, count: 34 }
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products with varied ratings`);

    await mongoose.connection.close();
    console.log("✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedProducts();

