const logger = require("../config/logger.js");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errMessage = err.message || "Internal Server Error";

  if (statusCode >= 400 && statusCode < 500) {
    logger.warn(`Client Request Warning [${statusCode}]: ${errMessage}`, {
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.error("❌ Central Database/Server Error:", err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: errMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
