const express = require("express");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const validateDto = require("../middleware/validateDTO.js");
const requireAuth = require("../middleware/requireAuth.js");
const {
  register,
  login,
  refresh,
  logout,
  deleteAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.js");

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Sanitizes user inputs with Zod, hashes passwords securely using bcrypt, and returns an encrypted JWT authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: Account created successfully. Returns the token and user record.
 *       400:
 *         description: Validation failed (Zod error catching) or email already registered.
 *       500:
 *         description: Internal Server Error.
 *
 * /auth/login:
 *   post:
 *     summary: Log into an existing account
 *     description: Authenticates user credentials via bcrypt string comparison and issues an active tracking token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securepassword123"
 *     responses:
 *       200:
 *         description: Logged in successfully. Returns an active authorization token.
 *       401:
 *         description: Invalid email or password credentials.
 *       400:
 *         description: Validation failed (Zod input constraints violated).
 *       500:
 *         description: Internal Server Error.
 *
 * /auth/refresh:
 *   post:
 *     summary: Exchange a secure refresh token cookie for a brand new access token
 *     description: Reads the encrypted refresh token automatically from incoming browser HTTP-Only cookies. If valid and verified against the PostgreSQL whitelist, it generates a fresh 15-minute access token.
 *     responses:
 *       200:
 *         description: Token rotation successful. Returns a new short-lived access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Refresh token is missing, expired, or has been revoked from the database whitelist.
 *       500:
 *         description: Internal Server Error.
 *
 * /auth/logout:
 *   post:
 *     summary: Log out of the current session
 *     description: Revokes the refresh token by deleting it from the PostgreSQL whitelist and clears the HTTP-Only refresh token cookie. Safe to call even without an active session.
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       500:
 *         description: Internal Server Error.
 *
 * /auth/account:
 *   delete:
 *     summary: Permanently delete the authenticated user's account
 *     description: Requires a valid access token. Revokes all refresh tokens issued to the user across every session/device, deletes the user record, and clears the refresh token cookie. This action is irreversible.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Missing or invalid access token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Accepts a user's email address and, if the account exists, generates a secure, short-lived cryptographic reset token stored as a SHA-256 hash. Simulates or dispatches an email containing the raw token link. This endpoint is public and deliberately returns a generic success message to prevent user enumeration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "msayev02@gmail.com"
 *     responses:
 *       200:
 *         description: Request processed successfully. Generic fallback response used for security containment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "If an account matches that email, a password reset link has been sent."
 *       400:
 *         description: Missing email in the request body or invalid validation payload format.
 *       500:
 *         description: Internal Server Error.
 * /auth/reset-password:
 *   post:
 *     summary: Set a new password
 *     description: Accepts user's new password with the token taken from url and sets it to a new one if not expired and successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - token
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "124214"
 *               token:
 *                  type: string
 *                  example: "egi2et203it32iprj3ij-orj2-9j"
 *     responses:
 *       200:
 *         description: Request processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password has been reset successfully! You can now log in."
 *       400:
 *         description: Missing token or password, or the reset token is invalid or has expired.
 *       500:
 *         description: Internal Server Error.
 */

router.post("/register", validateDto.registerUser, asyncWrapper(register));
router.post("/login", validateDto.loginUser, asyncWrapper(login));
router.post("/refresh", asyncWrapper(refresh));
router.post("/logout", asyncWrapper(logout));
router.delete("/account", requireAuth, asyncWrapper(deleteAccount));
router.post(
  "/forgot-password",
  validateDto.forgotPassword,
  asyncWrapper(forgotPassword),
);
router.post(
  "/reset-password",
  validateDto.resetPassword,
  asyncWrapper(resetPassword),
);

module.exports = router;
