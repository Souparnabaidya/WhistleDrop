
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = process.env.PORT || 3000;

// Hide Express technology details.
app.disable("x-powered-by");

// Add standard HTTP security headers.
app.use(helmet());

// Allow requests without a browser origin (such as Postman),
// localhost during development, and an explicitly configured frontend.
const allowedOrigins = [
    "http://localhost:3000",
    ...(process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
        : [])
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin not allowed by CORS"));
    }
}));

// Parse JSON requests, with a size limit.
app.use(express.json({ limit: "20kb" }));

// Rate limit API requests.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

// Apply a stricter limit to moderator login attempts.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to WhistleDrop API"
    });
});

// API documentation.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api-docs.json", (req, res) => {
    res.json(swaggerSpec);
});

// Connect to MongoDB before starting the API.
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from the .env file.");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from the .env file.");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");

        const reportRoutes = require("./routes/reportRoutes");
        const authRoutes = require("./routes/authRoutes");
        const moderatorRoutes = require("./routes/moderatorRoutes");

        app.use("/api/reports", apiLimiter, reportRoutes);
        app.use("/api/auth", loginLimiter, authRoutes);
        app.use("/api/moderator", apiLimiter, moderatorRoutes);

        // Return JSON for malformed JSON request bodies.
        app.use((err, req, res, next) => {
            if (err instanceof SyntaxError && "body" in err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON request body."
                });
            }

            if (err.message === "Origin not allowed by CORS") {
                return res.status(403).json({
                    success: false,
                    message: "Request origin is not allowed."
                });
            }

            console.error("Request error:", err.message);

            return res.status(500).json({
                success: false,
                message: "An unexpected server error occurred."
            });
        });

        app.listen(PORT, () => {
            console.log(`WhistleDrop server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exitCode = 1;
    }
}

startServer();