// const authService = require("../services/auth.service");
// const logger = require("../config/logger");

// exports.register = async (req, res, next) => {
//   try {
//     logger.info("Auth controller: register request", { email: req.body.email });
//     const user = await authService.register(req.body);
//     logger.info("User registered successfully", { userId: user._id });
//     res.status(201).json({
//       message: "User registered successfully",
//       userId: user._id
//     });
//   } catch (err) {
//     logger.error("Auth controller: register failed", err);
//     next(err);
//   }
// };

// exports.login = async (req, res, next) => {
//   try {
//     logger.info("Auth controller: login request", { email: req.body.email });
//     const tokens = await authService.login(
//       req.body.email,
//       req.body.password
//     );

//     res.json(tokens);
//   } catch (err) {
//     logger.error("Auth controller: login failed", err);
//     next(err);
//   }
// };

// exports.refresh = async (req, res, next) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

//     const tokens = await authService.refresh(refreshToken);
//     res.json(tokens);
//   } catch (err) {
//     res.status(401).json({ message: "Invalid or expired refresh token" });
//   }
// };
const authService = require("../services/auth.service");
const logger = require("../config/logger");
const AppError = require("../utils/AppError");

exports.register = async (req, res, next) => {

  try {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError("All fields are required", 400);
    }

    logger.info("Register request", { email });

    const user = await authService.register(req.body);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      userId: user._id
    });

  } catch (err) {
    next(err);
  }

};

exports.login = async (req, res, next) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email and password required", 400);
    }

    const result = await authService.login(email, password);

    res.json({
      status: "success",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        name: result.user.name,
        email: result.user.email
      }
    });

  } catch (err) {
    next(err);
  }

};

exports.refresh = async (req, res, next) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const tokens = await authService.refresh(refreshToken);

    res.json(tokens);

  } catch (err) {
    next(err);
  }

};

exports.forgotPassword = async (req, res, next) => {

  try {

    const { email } = req.body;

    if (!email) {
      throw new AppError("Email required", 400);
    }

    const result = await authService.forgotPassword(email);

    res.json({
      status: "success",
      message: result.message
    });

  } catch (err) {
    next(err);
  }

};

exports.resetPassword = async (req, res, next) => {

  try {

    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      throw new AppError("Password required", 400);
    }

    const result = await authService.resetPassword(token, password);

    res.json({
      status: "success",
      message: result.message
    });

  } catch (err) {
    next(err);
  }

};