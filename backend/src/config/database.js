
const mongoose = require("mongoose");
const logger = require("./logger");

exports.connectDB = async () => {
  try {
    logger.info("Establishing the MongoDB, databaseName: ",process.env.databaseName)
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};