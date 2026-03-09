const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const tokens = await authService.login(
      req.body.email,
      req.body.password
    );

    res.json(tokens);
  } catch (err) {
    next(err);
  }
};