const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()]
});