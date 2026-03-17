const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = createLogger({
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const extra = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
          return `[${timestamp}] ${level}: ${message}${extra}`;
        })
      ),
    }),
    new transports.File({ filename: path.join(logDir, "combined.log"), level: "info" }),
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
  ],
});
