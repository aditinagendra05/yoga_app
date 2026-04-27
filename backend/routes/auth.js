const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * POST /auth/token
 * Body: { email }
 * Returns a signed JWT (24h expiry)
 */
router.post('/token', (req, res) => {
  const user = req.body;
  if (!user?.email) return res.status(400).json({ error: true, message: 'Email is required' });

  const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

module.exports = router;