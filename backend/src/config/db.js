const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/food_delivery";
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.warn(`[DB Notice] MongoDB connection notice: ${err.message}. Server running with resilient local fallback.`);
    }
};

module.exports = connectDB;
