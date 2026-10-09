
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Moderator = require("../models/Moderator");

async function createModerator() {
    try {
        const username = process.env.MODERATOR_USERNAME;
        const password = process.env.MODERATOR_PASSWORD;

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing.");
        }

        if (!username || !password) {
            throw new Error(
                "MODERATOR_USERNAME and MODERATOR_PASSWORD must be configured."
            );
        }

        if (password.length < 16) {
            throw new Error(
                "Use a moderator password of at least 16 characters."
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        const hashedPassword = await bcrypt.hash(password, 12);

        await Moderator.findOneAndUpdate(
            { username },
            { $set: { password: hashedPassword } },
            { upsert: true, new: true, runValidators: true }
        );

        console.log("Moderator account created or updated successfully.");
    } catch (error) {
        console.error("Moderator setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

createModerator();