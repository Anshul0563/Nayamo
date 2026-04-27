const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in .env");
      process.exit(1);
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    // Check if admin already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("⚠️  User already exists. Updating to admin...");
      existingUser.role = "admin";
      existingUser.isActive = true;
      await existingUser.save();
      console.log("✅ Existing user updated to admin");
    } else {
      // Create admin user (password hashed by pre-save hook)
      const admin = await User.create({
        name: process.env.ADMIN_NAME || "System Admin",
        email,
        password,
        role: "admin",
        isActive: true,
      });

      console.log("✅ Admin created successfully");
      console.log("📧 Email:", admin.email);
      console.log("🔑 Role:", admin.role);
    }

    await mongoose.connection.close();
    console.log("✅ Done");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();

