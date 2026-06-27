const createNotFoundHandler = (customMessage) => {
  return (req, res, next) => {
    const error = new Error(customMessage || "Resource not found");
    error.statusCode = 404;
    return next(error);
  };
};

module.exports = createNotFoundHandler;
