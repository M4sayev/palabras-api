const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    const error = new Error("No access token provided");
    error.statusCode = 401;
    return next(error);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error("Invalid or expired access token");
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = requireAuth;
