
const express = require("express");
const {
    createReport,
    getReportByCaseCode
} = require("../controllers/reportController");

const router = express.Router();

/**
 * @openapi
 * /api/reports:
 *   post:
 *     summary: Submit an anonymous report
 *     tags:
 *       - Anonymous Reports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - description
 *             properties:
 *               category:
 *                 type: string
 *                 enum:
 *                   - Security
 *                   - Harassment
 *                   - Corruption
 *                   - Technical
 *                   - Other
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *               evidenceUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       "201":
 *         description: Report submitted successfully
 *       "400":
 *         description: Invalid report input
 */
router.post("/", createReport);

/**
 * @openapi
 * /api/reports/{caseCode}:
 *   get:
 *     summary: Check report status anonymously
 *     tags:
 *       - Anonymous Reports
 *     parameters:
 *       - in: path
 *         name: caseCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Case code received after submitting a report
 *     responses:
 *       "200":
 *         description: Report status retrieved successfully
 *       "404":
 *         description: Invalid case code
 */
router.get("/:caseCode", getReportByCaseCode);

module.exports = router;