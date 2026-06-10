const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode');
const authenticate = require('../middleware/auth');

// Admin‑only: create a promo code
router.post('/create', authenticate, async (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  const promo = await PromoCode.create(req.body);
  res.status(201).json(promo);
});

// Validate a promo code (public)
router.post('/validate', async (req, res) => {
  const { code } = req.body;
  const promo = await PromoCode.findOne({ code, expiresAt: { $gt: Date.now() } });
  if (!promo) return res.status(400).json({ error: 'Invalid or expired' });
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return res.status(400).json({ error: 'Usage limit reached' });
  }
  res.json({ valid: true, promo });
});

// Increment usage after successful discount
router.post('/mark-used/:id', async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(
    req.params.id,
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  res.json(promo);
});

module.exports = router;
