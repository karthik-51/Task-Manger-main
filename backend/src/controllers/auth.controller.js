const authService = require("../services/auth.service");
const logger = require("../config/logger");

exports.register = async (req, res, next) => {
  try {
    logger.info("Auth controller: register request", { email: req.body.email });
    const user = await authService.register(req.body);
    logger.info("User registered successfully", { userId: user._id });
    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (err) {
    logger.error("Auth controller: register failed", err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    logger.info("Auth controller: login request", { email: req.body.email });
    const tokens = await authService.login(
      req.body.email,
      req.body.password
    );

    res.json(tokens);
  } catch (err) {
    logger.error("Auth controller: login failed", err);
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};