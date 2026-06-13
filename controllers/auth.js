const pool = require("../db/connect.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)",
    [user.id, refreshToken],
  );

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userExists.rows.length > 0) {
    const error = new Error("A user with this email already exists");
    error.statusCode = 400;
    return next(error);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const queryText = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, user)
    RETURNING id, name, email, role;
  `;

  const result = await pool.query(queryText, [name, email, hashedPassword]);
  const newUser = result.rows[0];

  const token = jwt.sign(
    { id: newUser.id, role: newUser.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return res.status(201).json({
    success: true,
    message: "Account created successfully!",
    token,
    user: newUser,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    return next(error);
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: `Logged in successfully! Hello ${user.name}!!`,
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const refresh = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    const error = new Error("Refresh token missing");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const tokenCheck = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2",
      [refreshToken, decoded.id],
    );

    if (tokenCheck.rows.length === 0) {
      const error = new Error("Invalid or revoked refresh token");
      error.statusCode = 401;
      return next(error);
    }

    const userResult = await pool.query(
      "SELECT id, role FROM users WHERE id = $1",
      [decoded.id],
    );
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    const error = new Error("Refresh token expired or tampered");
    error.statusCode = 401;
    return next(error);
  }
};

module.exports = { register, login, refresh };
