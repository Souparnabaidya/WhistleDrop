
const express = require("express");
const { moderatorLogin } = require("../controllers/authController");

const router = express.Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in as a moderator
 *     tags:
 *       - Moderator Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: moderator
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       "200":
 *         description: Login successful; returns a JWT token
 *       "400":
 *         description: Missing username or password
 *       "401":
 *         description: Invalid credentials
 */
router.post("/login", moderatorLogin);

module.exports = router;