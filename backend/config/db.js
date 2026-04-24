const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 sec max wait
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected 💎 : ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.log("Mongo Runtime Error ❌:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected ⚠️");
    });
  } catch (error) {
    console.log("DB Error ❌:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;