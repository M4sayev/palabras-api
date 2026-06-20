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
 */

router.post("/register", validateDto.registerUser, asyncWrapper(register));
router.post("/login", validateDto.loginUser, asyncWrapper(login));
router.post("/refresh", asyncWrapper(refresh));
router.post("/logout", asyncWrapper(logout));
router.delete("/account", requireAuth, asyncWrapper(deleteAccount));

module.exports = router;
