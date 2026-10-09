const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        caseCode: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Security",
                "Harassment",
                "Corruption",
                "Technical",
                "Other"
            ]
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 5000
        },

        evidenceUrl: {
            type: String,
            trim: true,
            default: null
        },

        status: {
            type: String,
            enum: [
                "SUBMITTED",
                "UNDER_REVIEW",
                "RESOLVED",
                "DISMISSED"
            ],
            default: "SUBMITTED"
        },

        statusUpdate: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Report", reportSchema);