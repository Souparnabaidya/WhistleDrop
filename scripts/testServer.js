const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

console.log("Starting diagnostic server...");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "WhistleDrop diagnostic server"
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connection SUCCESS");

        app.listen(3000, () => {
            console.log("Diagnostic server running on port 3000");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection FAILED");
        console.error(error.message);
    });