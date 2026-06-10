const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  amount: { type: Number, required: true }, // percentage (0-100) or fixed amount
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoSchema);
