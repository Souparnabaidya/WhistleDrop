
const crypto = require("crypto");
const Report = require("../models/Report");

function generateCaseCode() {
    return "WD-" + crypto.randomBytes(6).toString("hex").toUpperCase();
}

const createReport = async (req, res) => {
    try {
        const { category, description, evidenceUrl } = req.body || {};

        const allowedCategories = [
            "Security",
            "Harassment",
            "Corruption",
            "Technical",
            "Other"
        ];

        if (
            typeof category !== "string" ||
            !allowedCategories.includes(category)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid category is required."
            });
        }

        if (typeof description !== "string") {
            return res.status(400).json({
                success: false,
                message: "A description is required."
            });
        }

        const cleanDescription = description.trim();

        if (cleanDescription.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Description must be at least 10 characters long."
            });
        }

        if (cleanDescription.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Description must not exceed 5000 characters."
            });
        }

        let cleanEvidenceUrl = null;

        if (evidenceUrl !== undefined && evidenceUrl !== null && evidenceUrl !== "") {
            if (typeof evidenceUrl !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Evidence URL must be a valid HTTP or HTTPS URL."
                });
            }

            try {
                const parsedUrl = new URL(evidenceUrl);

                if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                    throw new Error("Unsupported URL protocol");
                }

                cleanEvidenceUrl = parsedUrl.toString();
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Evidence URL must be a valid HTTP or HTTPS URL."
                });
            }
        }

        const report = new Report({
            caseCode: generateCaseCode(),
            category,
            description: cleanDescription,
            evidenceUrl: cleanEvidenceUrl
        });

        await report.save();

        return res.status(201).json({
            success: true,
            message: "Report submitted successfully.",
            caseCode: report.caseCode,
            status: report.status
        });
    } catch (error) {
        console.error("Create report error:", error.message);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid report data."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to submit report."
        });
    }
};

const getReportByCaseCode = async (req, res) => {
    try {
        const { caseCode } = req.params;

        if (
            typeof caseCode !== "string" ||
            !/^WD-[A-F0-9]{12}$/i.test(caseCode)
        ) {
            return res.status(404).json({
                success: false,
                message: "Invalid case code."
            });
        }

        const report = await Report.findOne({
            caseCode: caseCode.toUpperCase()
        }).select(
            "caseCode category status statusUpdate createdAt updatedAt -_id"
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Invalid case code."
            });
        }

        return res.status(200).json({
            success: true,
            report
        });
    } catch (error) {
        console.error("Get report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve report."
        });
    }
};

module.exports = {
    createReport,
    getReportByCaseCode
};