// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model");
// const logger = require("../config/logger");

// const generateAccess = (user) =>
//   jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_EXPIRE });

// const generateRefresh = (user) =>
//   jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRE });


// exports.register = async (data) => {
//   logger.info("Auth service: register", { email: data.email });
//   const existing = await User.findOne({ email: data.email });
//   if (existing) {
//     logger.warn("Auth service: email already registered", { email: data.email });
//     throw new Error("Email already registered");
//   }

//   const user = await User.create(data);
//   logger.info("Auth service: user created", { userId: user._id });
//   return user;
// };


// exports.login = async (email, password) => {
//   logger.info("Auth service: login attempt", { email });
//   const user = await User.findOne({ email });
//   if (!user || !(await user.comparePassword(password))) {
//     logger.warn("Auth service: invalid credentials", { email });
//     throw new Error("Invalid credentials");
//   }

//   const accessToken = generateAccess(user);
//   const refreshToken = generateRefresh(user);

//   user.refreshToken = refreshToken;
//   await user.save();

//   logger.info("Auth service: user logged in", { userId: user._id });
//   return { accessToken, refreshToken };
// };

// exports.refresh = async (token) => {
//   const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

//   const user = await User.findById(payload.id);
//   if (!user || user.refreshToken !== token)
//     throw new Error("Invalid refresh token");

//   return { accessToken: generateAccess(user) };
// };
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const logger = require("../config/logger");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const generateAccess = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_EXPIRE }
  );

const generateRefresh = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRE }
  );

exports.register = async (data) => {

  logger.info("Auth service: register", { email: data.email });

  const existing = await User.findOne({ email: data.email });

  if (existing) {
    logger.warn("Email already registered", { email: data.email });
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create(data);

  logger.info("User created", { userId: user._id });

  return user;
};

exports.login = async (email, password) => {

  logger.info("Login attempt", { email });

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = generateAccess(user);
  const refreshToken = generateRefresh(user);

  user.refreshToken = refreshToken;
  await user.save();

  logger.info("Login success", { userId: user._id });

  // ✅ RETURN USER ALSO
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

exports.refresh = async (token) => {

  try {

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== token) {
      throw new AppError("Invalid refresh token", 401);
    }

    return {
      accessToken: generateAccess(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

  } catch {
    throw new AppError("Expired refresh token", 401);
  }
};
exports.forgotPassword = async (email) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save();

  const resetURL =
    `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    html: `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password</p>
      <a href="${resetURL}">${resetURL}</a>
    `
  });

  return { message: "Reset email sent" };

};

exports.resetPassword = async (token, password) => {

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  user.password = password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return { message: "Password updated successfully" };

};