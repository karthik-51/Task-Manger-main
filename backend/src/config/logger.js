const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

// ensure log directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = createLogger({
  level: "info", // default minimum level
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    // write all logs at info level and above to combined.log
    new transports.File({ filename: path.join(logDir, "combined.log"), level: "info" }),
    // errors to error.log
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    // you can add other level-specific files, e.g. a debug.log for "debug" level
  ],
});