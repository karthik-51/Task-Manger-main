const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://localhost:27017/taskmanager_test");

async function seed() {
  await User.deleteMany();

  const hashed = await bcrypt.hash("123456", 10);

  await User.create({
    email: "test@gmail.com",
    password: hashed,
  });

  console.log("Test user created");
  process.exit();
}

seed();