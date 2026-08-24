const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [{ name: String, price: Number, quantity: { type: Number, default: 1 } }],
    total: Number,
    discount: { type: Number, default: 0 },
    walletDeduction: { type: Number, default: 0 },
    paymentMethod: String,
    paymentStatus: String,
    deliveryAddress: String,
    razorpayOrderId: String,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    status: { type: String, enum: ['pending', 'preparing', 'out-for-delivery', 'delivered'], default: 'pending' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
