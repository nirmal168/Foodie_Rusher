// backend/src/middlewares/auth.js

const jwt = require('jsonwebtoken');

/**
 * Express middleware to verify JWT token.
 * Expects token in the `Authorization` header as `Bearer <token>`.
 * On success, attaches decoded payload to `req.user` and calls next().
 * On failure, responds with 401/403.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'foodie_rusher_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // attach payload (e.g., userId, role)
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticate;
