const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Debug users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
