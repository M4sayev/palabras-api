const express = require("express");
const asyncWrapper = require("../middleware/asyncWrapper.js");
const validateDto = require("../middleware/validateDTO.js");
const { register, login } = require("../controllers/auth.js");

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
 */

router.post("/register", validateDto.registerUser, asyncWrapper(register));
router.post("/login", validateDto.loginUser, asyncWrapper(login));

module.exports = router;
