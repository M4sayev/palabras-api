const pool = require("../db/connect.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createNotFoundHandler = require("../errors/notFoundError.js");
const forgotPasswordHTML = require("../templates/forgot-password.js");
const sendEmail = require("../config/sendMail.js");

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);

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
    VALUES ($1, $2, $3, 'user')
    RETURNING id, name, email, role;
  `;

  const result = await pool.query(queryText, [name, email, hashedPassword]);
  const newUser = result.rows[0];

  const { accessToken, refreshToken } = await generateTokens(newUser);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  return res.status(201).json({
    success: true,
    message: "Account created successfully!",
    accessToken,
    user: newUser,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    return createNotFoundHandler("A user with this email does not exist")(
      req,
      res,
      next,
    );
  }

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
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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

const logout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const deleteAccount = async (req, res, next) => {
  const userId = req.user.id;

  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [userId],
  );

  if (result.rows.length === 0) {
    return createNotFoundHandler("User not found")(req, res, next);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
};

const forgotPassword = async (req, res, next) => {
  const email = req.body.email;
  const queryText = `
    SELECT * FROM users 
    WHERE email = $1;
  `;

  const result = await pool.query(queryText, [email]);

  const successResponse = {
    success: "true",
    messages: "A reset link has been sent",
  };

  if (result.rows.length === 0) {
    return res.status(200).json(successResponse);
  }

  const user = result.rows[0];

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  const updateQuery = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2 
      WHERE id = $3;
    `;

  await pool.query(updateQuery, [hashedToken, tokenExpiry, user.id]);

  const resetUrl = `http://localhost:3000/reset-password.html?token=${resetToken}`;

  console.log(
    `\n📨 [EMAIL SIMULATOR] Reset Link sent to ${email}:\n${resetUrl}\n`,
  );

  sendEmail({
    email: user.email,
    subject: "Your password reset link",
    html: forgotPasswordHTML(resetUrl),
  });

  return res.status(200).json(successResponse);
};

const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    const error = new Error("Please provide a token and a new password.");
    error.statusCode = 400;
    return next(error);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const queryText = `
    SELECT id FROM users 
    WHERE reset_password_token = $1 AND reset_password_expires > now();
  `;

  const result = await pool.query(queryText, [hashedToken]);

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Token is invalid or has expired.");
    error.statusCode = 400;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updateQuery = `
    UPDATE users
    SET password = $1, reset_password_token = NULL, reset_password_expires = NULL
    WHERE id = $2;
  `;

  await pool.query(updateQuery, [hashedPassword, user.id]);

  return res.status(200).json({
    success: true,
    message: "Password has been reset successfully! You can now log in.",
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  deleteAccount,
  forgotPassword,
  resetPassword,
};
