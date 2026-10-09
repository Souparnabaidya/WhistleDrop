
const mongoose = require("mongoose");
const Report = require("../models/Report");

const getReports = async (req, res) => {
    try {
        const { category, status } = req.query;
        const filter = {};

        const allowedCategories = [
            "Security",
            "Harassment",
            "Corruption",
            "Technical",
            "Other"
        ];

        const allowedStatuses = [
            "SUBMITTED",
            "UNDER_REVIEW",
            "RESOLVED",
            "DISMISSED"
        ];

        if (category && !allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category filter."
            });
        }

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status filter."
            });
        }

        if (category) filter.category = category;
        if (status) filter.status = status;

        const reports = await Report.find(filter)
            .select(
                "caseCode category description evidenceUrl status statusUpdate createdAt updatedAt"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        console.error("Get reports error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve reports."
        });
    }
};

const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, statusUpdate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report ID."
            });
        }

        const allowedStatuses = [
            "SUBMITTED",
            "UNDER_REVIEW",
            "RESOLVED",
            "DISMISSED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report status."
            });
        }

        if (
            statusUpdate !== undefined &&
            (typeof statusUpdate !== "string" ||
                statusUpdate.length > 1000)
        ) {
            return res.status(400).json({
                success: false,
                message: "Status update must be text of at most 1000 characters."
            });
        }

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found."
            });
        }

        const allowedTransitions = {
            SUBMITTED: ["UNDER_REVIEW"],
            UNDER_REVIEW: ["RESOLVED", "DISMISSED"],
            RESOLVED: [],
            DISMISSED: []
        };

        if (!allowedTransitions[report.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${report.status} to ${status}.`
            });
        }

        report.status = status;

        if (statusUpdate !== undefined) {
            report.statusUpdate = statusUpdate.trim();
        }

        await report.save();

        return res.status(200).json({
            success: true,
            message: "Report updated successfully.",
            report: {
                caseCode: report.caseCode,
                category: report.category,
                status: report.status,
                statusUpdate: report.statusUpdate,
                updatedAt: report.updatedAt
            }
        });
    } catch (error) {
        console.error("Update report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to update report."
        });
    }
};

module.exports = {
    getReports,
    updateReport
};