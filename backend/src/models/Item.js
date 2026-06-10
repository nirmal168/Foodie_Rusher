const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    category: {
        type: String,
        enum: [
            'Pizza',
            'Burgers',
            'Sushi',
            'Desserts',
            'Salads',
            'Drinks',
            'Snacks',
            'Main Course',
            'Sandwiches',
            'South Indian',
            'North Indian',
            'Chinese',
            'Fast Food',
            'Others'
        ],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    foodType: {
        type: String,
        enum: ["veg", "non-veg"],
        required: true
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
