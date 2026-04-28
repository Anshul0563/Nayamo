const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing in .env");
      return false;
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected 💎 : ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("Mongo Runtime Error ❌:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      console.warn("⚠️ MongoDB Disconnected");
    });

    mongoose.connection.on("connected", () => {
      isConnected = true;
      console.log("✅ MongoDB Reconnected");
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error("❌ DB Connection Failed:", error.message);
    console.error("👉 Fix: Whitelist your IP in MongoDB Atlas, or check MONGO_URI in .env");
    return false;
  }
};

const checkDB = () => isConnected;

module.exports = connectDB;
module.exports.checkDB = checkDB;
