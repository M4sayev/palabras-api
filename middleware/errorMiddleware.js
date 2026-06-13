const errorHandler = (err, req, res, next) => {
  console.error("❌ Central Database/Server Error:", err.message || err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;
