const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Connected");

    // Clear existing products
    await Product.deleteMany({});
    console.log(" Cleared existing products");

    const products = [
      // ---------------- EARRINGS ----------------
      {
        title: "Royal Diamond Studs",
        description: "Premium diamond earrings for special occasions",
        price: 25000,
        category: "bridal",
        jewelleryType: "earrings",
        stock: 5,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.8, count: 23 }
      },
      {
        title: "Golden Hoops",
        description: "Classic 22k gold hoop earrings",
        price: 8500,
        category: "party",
        jewelleryType: "earrings",
        stock: 12,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.2, count: 15 }
      },
      {
        title: "Pearl Drops",
        description: "Elegant pearl drop earrings for daily wear",
        price: 3200,
        category: "daily",
        jewelleryType: "earrings",
        stock: 8,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.9, count: 28 }
      },
      {
        title: "Statement Chandbalis",
        description: "Traditional chandbali earrings with kundan work",
        price: 18000,
        category: "traditional",
        jewelleryType: "earrings",
        stock: 3,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.5, count: 17 }
      },

      // ---------------- NECKLACES ----------------
      {
        title: "Emerald Kundan Necklace",
        description: "Regal kundan necklace set with emerald drops for festive wear",
        price: 22000,
        category: "bridal",
        jewelleryType: "necklaces",
        stock: 6,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.7, count: 19 }
      },
      {
        title: "Pearl Layered Necklace",
        description: "Elegant layered pearl strand necklace for evening events",
        price: 5800,
        category: "party",
        jewelleryType: "necklaces",
        stock: 10,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.1, count: 11 }
      },
      {
        title: "Rose Gold Chain Necklace",
        description: "Sleek rose gold pendant necklace for daily elegance",
        price: 2400,
        category: "daily",
        jewelleryType: "necklaces",
        stock: 18,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.8, count: 21 }
      },

      // ---------------- RINGS ----------------
      {
        title: "Solitaire Statement Ring",
        description: "Bold solitaire ring with cubic zirconia stone",
        price: 3400,
        category: "statement",
        jewelleryType: "rings",
        stock: 9,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.4, count: 14 }
      },
      {
        title: "Gold Band Ring",
        description: "Classic polished gold band ring for every day",
        price: 1800,
        category: "daily",
        jewelleryType: "rings",
        stock: 22,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.0, count: 16 }
      },
      {
        title: "Kundan Ring Set",
        description: "Traditional kundan ring set for festive styling",
        price: 2900,
        category: "traditional",
        jewelleryType: "rings",
        stock: 7,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.3, count: 8 }
      },

      // ---------------- BRACELETS ----------------
      {
        title: "Tennis Bracelet",
        description: "Sparkling cubic zirconia tennis bracelet",
        price: 4600,
        category: "party",
        jewelleryType: "bracelets",
        stock: 8,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.6, count: 13 }
      },
      {
        title: "Beaded Charm Bracelet",
        description: "Whimsical beaded bracelet with gold charms",
        price: 1600,
        category: "daily",
        jewelleryType: "bracelets",
        stock: 20,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.7, count: 9 }
      },

      // ---------------- BANGLES ----------------
      {
        title: "Gold Plated Bangle Set",
        description: "Set of polished gold plated bangles",
        price: 3800,
        category: "traditional",
        jewelleryType: "bangles",
        stock: 14,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.2, count: 18 }
      },
      {
        title: "Kundan Work Bangles",
        description: "Ornate kundan bangles for festivals",
        price: 5200,
        category: "bridal",
        jewelleryType: "bangles",
        stock: 6,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.5, count: 12 }
      },

      // ---------------- ANKLETS ----------------
      {
        title: "Silver Tone Anklet",
        description: "Delicate silver tone anklet with tiny bells",
        price: 1400,
        category: "daily",
        jewelleryType: "anklets",
        stock: 25,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 3.9, count: 10 }
      },
      {
        title: "Gold Anklet Chain",
        description: "Elegant gold anklet chain for festive dressing",
        price: 2100,
        category: "party",
        jewelleryType: "anklets",
        stock: 11,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.0, count: 7 }
      },

      // ---------------- JEWELLERY SETS ----------------
      {
        title: "Bridal Jewellery Set",
        description: "Complete bridal set of necklace, earrings and maang tikka",
        price: 32000,
        category: "bridal",
        jewelleryType: "sets",
        stock: 4,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.9, count: 25 }
      },
      {
        title: "Party Wear Jewellery Set",
        description: "Matched necklace and earring set for parties",
        price: 6800,
        category: "party",
        jewelleryType: "sets",
        stock: 9,
        images: [{ url: "https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Nayamo+Jewelry", publicId: "" }],
        ratings: { average: 4.3, count: 14 }
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products across all jewellery types:`);
    const counts = products.reduce((acc, p) => {
      acc[p.jewelleryType] = (acc[p.jewelleryType] || 0) + 1;
      return acc;
    }, {});
    console.log(counts);

    await mongoose.connection.close();
    console.log("✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedProducts();
