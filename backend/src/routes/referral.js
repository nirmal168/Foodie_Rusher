const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');
const crypto = require('crypto');
const authenticate = require('../middleware/auth');

// Generate a new referral code (owner only)
router.post('/generate', authenticate, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  const referral = await Referral.create({ code, owner: req.user.userId });
  res.status(201).json({ code });
});

// Redeem a referral code (customer)
router.post('/redeem', authenticate, async (req, res) => {
  const { code } = req.body;
  const referral = await Referral.findOne({ code, expiresAt: { $gt: Date.now() } });
  if (!referral) return res.status(400).json({ error: 'Invalid or expired code' });
  if (referral.usedBy.includes(req.user.userId)) {
    return res.status(400).json({ error: 'Code already used by this user' });
  }
  // credit both parties
  await User.findByIdAndUpdate(req.user.userId, {
    $inc: { walletBalance: referral.rewardAmount }
  });
  await User.findByIdAndUpdate(referral.owner, {
    $inc: { walletBalance: referral.rewardAmount }
  });
  referral.usedBy.push(req.user.userId);
  await referral.save();
  res.json({ message: 'Referral redeemed', credit: referral.rewardAmount });
});

module.exports = router;
