const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authenticate = require("../middleware/auth");

router.get('/orders', authenticate, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let query = {};
    if (role === 'customer') query = { customerId: userId };
    else if (role === 'owner') query = {};
    else if (role === 'staff') query = { staffId: userId };
    const orders = await Order.find(query).populate('customerId', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile orders' });
  }
});

module.exports = router;
