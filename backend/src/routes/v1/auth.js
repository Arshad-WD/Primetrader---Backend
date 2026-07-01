const express = require('express');
const { register, login } = require("../../controllers/auth.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and session token management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new system user
 *     tags: [Auth]
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
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@primetrader.ai
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Account successfully registered
 *       400:
 *         description: User already exists or validation error
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user credentials and return JWT
 *     tags: [Auth]
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
 *                 example: john@primetrader.ai
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Authentication successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);

module.exports = router;