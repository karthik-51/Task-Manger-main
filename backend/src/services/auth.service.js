const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const generateAccess = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_EXPIRE });

const generateRefresh = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE });


  exports.register = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const user = await User.create(data);
  return user;
};


exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    throw new Error("Invalid credentials");

  const accessToken = generateAccess(user);
  const refreshToken = generateRefresh(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};