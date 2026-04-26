const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const email = "anshulshakya5632@gmail.com";
    const password = "Jarvis@563";

    // Check if admin already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log("⚠️  User already exists. Updating to admin...");
      existingUser.role = "admin";
      existingUser.isActive = true;
      await existingUser.save();
      console.log("✅ Existing user updated to admin");
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin user
      const admin = await User.create({
        name: "Anshul Shakya",
        email: email.toLowerCase(),
        password: hashedPassword,
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

