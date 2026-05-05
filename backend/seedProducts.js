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
        images: [{ url: "https://images.unsplash.com/photo-1574194119193-0d8b12d48d30?w=800", publicId: "" }],
        ratings: { average: 4.8, count: 23 }
      },
      {
        title: "Golden Hoops",
        description: "Classic 22k gold hoop earrings",
        price: 8500,
        category: "party",
        stock: 12,
        images: [{ url: "https://images.unsplash.com/photo-1582359646-ddff92ffe7e8?w=800", publicId: "" }],
        ratings: { average: 4.2, count: 15 }
      },
      {
        title: "Pearl Drops",
        description: "Elegant pearl drop earrings for daily wear",
        price: 3200,
        category: "daily",
        stock: 8,
        images: [{ url: "https://images.unsplash.com/photo-1606534175805-67c72dfa0714?w=800", publicId: "" }],
        ratings: { average: 3.9, count: 28 }
      },
      {
        title: "Statement Chandbalis",
        description: "Traditional chandbali earrings with kundan work",
        price: 18000,
        category: "traditional",
        stock: 3,
        images: [{ url: "https://images.unsplash.com/photo-1594434512195-6073398e1d2e?w=800", publicId: "" }],
        ratings: { average: 4.5, count: 17 }
      },
      {
        title: "Western Jhumkas",
        description: "Modern fusion jhumkas with contemporary design",
        price: 6500,
        category: "western",
        stock: 10,
        images: [{ url: "https://images.unsplash.com/photo-1593482497599-d7743b46d37b?w=800", publicId: "" }],
        ratings: { average: 3.5, count: 12 }
      },
      {
        title: "Bold Statement Rings Earrings",
        description: "Oversized geometric earrings for bold looks",
        price: 12000,
        category: "statement",
        stock: 6,
        images: [{ url: "https://images.unsplash.com/photo-1607986588901-e5df0d8927f7?w=800", publicId: "" }],
        ratings: { average: 4.1, count: 9 }
      },
      {
        title: "Simple Silver Studs",
        description: "Minimalist silver studs for everyday elegance",
        price: 1200,
        category: "daily",
        stock: 20,
        images: [{ url: "https://images.unsplash.com/photo-1617484648044-4629e7a52351?w=800", publicId: "" }],
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

