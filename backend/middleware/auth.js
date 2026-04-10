const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Verifies Bearer token, then fetches the user from DB to get current role.
 * Attaches { id, role, isEmailVerified } to req.user.
 * Fetching from DB (vs decoding from token) ensures role changes take effect immediately.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch live role from DB — ensures revoked/changed roles take effect immediately
    const user = await User.findById(decoded.id).select('role isEmailVerified');
    if (!user) return res.status(401).json({ error: 'User no longer exists.' });

    req.user = { id: decoded.id, role: user.role, isEmailVerified: user.isEmailVerified };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
