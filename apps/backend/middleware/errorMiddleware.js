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

  const responsePayload = {
    success: false,
    error: errMessage,
  };

  if (err.validationErrors) {
    responsePayload.validationErrors = err.validationErrors;
  }

  if (process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
