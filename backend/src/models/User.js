const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'owner', 'staff'], default: 'customer' },
    walletBalance: { type: Number, default: 0 },
    location: {
        lat: Number,
        lng: Number,
        updatedAt: { type: Date, default: Date.now }
    },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inviteCode: { type: String, index: true, sparse: true },
    staffRegistrationCode: { type: String, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    resetOtp: { type: String },
    isOtpVerified: { type: Boolean, default: false },
    otpExpires: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
