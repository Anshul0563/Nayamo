require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("✅ Admin already exists");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Nayamo Admin",
      email: "admin@nayamo.com",
      password: "nayamoAdmin123",
      role: "admin",
    });

    console.log(`✅ Admin created: ${admin.email}`);
    console.log("💡 Login: admin@nayamo.com / nayamoAdmin123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedAdmin();

