const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  logger.error(err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};