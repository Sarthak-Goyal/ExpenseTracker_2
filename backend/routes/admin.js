const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

// All admin routes require a valid JWT AND admin role
router.use(verifyToken, adminOnly);

// ── GET /api/admin/users ───────────────────────────────────────────
// List all users (without password hashes)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: err.message });
  }
});

// ── PUT /api/admin/users/:id/role ──────────────────────────────────
// Promote or demote a user's role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin".' });

    // Prevent admin from demoting themselves
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });

    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update role.', error: err.message });
  }
});

// ── DELETE /api/admin/users/:id ────────────────────────────────────
// Delete a user account (cascades to their entries and activity)
router.delete('/users/:id', async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user.', error: err.message });
  }
});

// ── GET /api/admin/activity ────────────────────────────────────────
// View all user activity logs with username joined
router.get('/activity', async (req, res) => {
  try {
    let query = `
      SELECT ua.id, ua.action, ua.details, ua.created_at,
             u.username, u.email
      FROM user_activity ua
      JOIN users u ON ua.user_id = u.id
    `;
    const params = [];

    // Optional filter by user_id
    if (req.query.user_id) {
      query += ' WHERE ua.user_id = ?';
      params.push(req.query.user_id);
    }

    query += ' ORDER BY ua.created_at DESC LIMIT 200';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity.', error: err.message });
  }
});

module.exports = router;
