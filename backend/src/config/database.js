// const mongoose = require("mongoose");

// exports.connectDB = async (uri) => {
//   await mongoose.connect(uri);
//   console.log("MongoDB Connected");
// };
const mongoose = require("mongoose");

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