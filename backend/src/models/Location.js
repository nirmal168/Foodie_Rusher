const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    district: { type: String, required: true },
    areas: [{
        name: { type: String, required: true },
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    }]
});

module.exports = mongoose.model("Location", locationSchema);
