// Author: Sarthak Goyal
const jwt = require('jsonwebtoken');

/**
 * Middleware: verifies the JWT token in the Authorization header.
 * Attaches the decoded user payload to req.user on success.
 * Returns 401 if the token is missing or invalid.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Middleware: allows only admin users through.
 * Must be used after verifyToken.
 */
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = { verifyToken, adminOnly };
