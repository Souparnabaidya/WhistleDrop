
const express = require("express");
const {
    getReports,
    updateReport
} = require("../controllers/moderatorController");
const protectModerator = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protectModerator);

/**
 * @openapi
 * /api/moderator/reports:
 *   get:
 *     summary: List and filter reports (moderator only)
 *     tags:
 *       - Moderator Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Security, Harassment, Corruption, Technical, Other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, UNDER_REVIEW, RESOLVED, DISMISSED]
 *     responses:
 *       "200":
 *         description: Reports retrieved successfully
 *       "401":
 *         description: Missing or invalid token
 */
router.get("/reports", getReports);

/**
 * @openapi
 * /api/moderator/reports/{id}:
 *   patch:
 *     summary: Update report status (moderator only)
 *     tags:
 *       - Moderator Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB report document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [UNDER_REVIEW, RESOLVED, DISMISSED]
 *               statusUpdate:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       "200":
 *         description: Report status updated
 *       "400":
 *         description: Invalid status or transition
 *       "401":
 *         description: Missing or invalid token
 *       "404":
 *         description: Report not found
 */
router.patch("/reports/:id", updateReport);

module.exports = router;