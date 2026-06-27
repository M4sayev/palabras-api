const winston = require("winston");
const path = require("path");

const {
  combine,
  timestamp,
  json,
  errors,
  combine: winstonCombine,
} = winston.format;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json(),
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "rejections.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, stack, service, ...meta }) => {
            const logMessage = stack || message;
            const metaString = Object.keys(meta).length
              ? `\n${JSON.stringify(meta, null, 2)}`
              : "";

            return `[${timestamp}] [${level}] [${service}]: ${logMessage}${metaString}`;
          },
        ),
      ),
    }),
  );
}

module.exports = logger;
