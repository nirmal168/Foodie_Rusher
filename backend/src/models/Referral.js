const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardAmount: { type: Number, default: 50 }, // credit awarded to both parties
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: () => Date.now() + 30*24*60*60*1000 } // 30 days
}, { timestamps: true });

module.exports = mongoose.model('Referral', referralSchema);
