const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Moderator = require("../models/Moderator");

const moderatorLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const moderator = await Moderator.findOne({ username });

        if (!moderator) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            moderator.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                moderatorId: moderator._id,
                username: moderator.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Moderator login successful.",
            token
        });

    } catch (error) {
        console.error("Moderator login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};

module.exports = {
    moderatorLogin
};