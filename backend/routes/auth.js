// Author: Sarthak Goyal
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../db');
const { verifyToken } = require('../middleware/auth');

// ── Helper: log user activity ──────────────────────────────────────
async function logActivity(userId, action, details = null) {
  try {
    await pool.query(
      'INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details]
    );
  } catch (_) { /* non-critical — don't crash the request if logging fails */ }
}

// ── POST /api/auth/register ────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    // Check if username or email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Username or email already taken.' });

    // Hash password with bcrypt (10 salt rounds)
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), password_hash]
    );

    await logActivity(result.insertId, 'register', 'New account created');

    res.status(201).json({ success: true, message: 'Account created successfully. Please log in.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed.', error: err.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (users.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user = users[0];

    // Compare plain password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    // Sign JWT with user id, username, and role — expires in 24 hours
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    await logActivity(user.id, 'login', 'User logged in');

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  await logActivity(req.user.id, 'logout', 'User logged out');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ── GET /api/auth/me ───────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, user: users[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.', error: err.message });
  }
});

module.exports = router;
