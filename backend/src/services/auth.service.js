const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../config/logger");

const generateAccess = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_EXPIRE });

const generateRefresh = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE });


exports.register = async (data) => {
  logger.info("Auth service: register", { email: data.email });
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    logger.warn("Auth service: email already registered", { email: data.email });
    throw new Error("Email already registered");
  }

  const user = await User.create(data);
  logger.info("Auth service: user created", { userId: user._id });
  return user;
};


exports.login = async (email, password) => {
  logger.info("Auth service: login attempt", { email });
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    logger.warn("Auth service: invalid credentials", { email });
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccess(user);
  const refreshToken = generateRefresh(user);

  user.refreshToken = refreshToken;
  await user.save();

  logger.info("Auth service: user logged in", { userId: user._id });
  return { accessToken, refreshToken };
};