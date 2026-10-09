const mongoose = require("mongoose");
require("dotenv").config();

console.log("Testing MongoDB connection...");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connection SUCCESS");
        console.log("Ready state:", mongoose.connection.readyState);
        process.exit(0);
    })
    .catch((error) => {
        console.error("MongoDB connection FAILED");
        console.error(error.message);
        process.exit(1);
    });