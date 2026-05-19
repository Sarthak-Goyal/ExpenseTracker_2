const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { verifyToken } = require('../middleware/auth');

const VALID_TYPES      = ['income', 'expense'];
const VALID_CATEGORIES = ['salary', 'groceries', 'utilities', 'entertainment', 'other'];

// ── Helper: log activity ───────────────────────────────────────────
async function logActivity(userId, action, details) {
  try {
    await pool.query(
      'INSERT INTO user_activity (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details]
    );
  } catch (_) {}
}

// All routes below require a valid JWT
router.use(verifyToken);

// ── READ: GET /api/entries ─────────────────────────────────────────
// Supports ?search=, ?type=, ?category= filters
router.get('/', async (req, res) => {
  try {
    let query  = 'SELECT * FROM expense_items WHERE user_id = ?';
    const params = [req.user.id];

    if (req.query.type && req.query.type !== 'all') {
      query += ' AND type = ?';
      params.push(req.query.type);
    }
    if (req.query.category && req.query.category !== 'all') {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    // Live search: filter by description containing the search term
    if (req.query.search && req.query.search.trim() !== '') {
      query += ' AND description LIKE ?';
      params.push(`%${req.query.search.trim()}%`);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch entries.', error: err.message });
  }
});

// ── CREATE: POST /api/entries ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;

    if (!description || !amount || !type || !category || !date)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (!VALID_TYPES.includes(type))
      return res.status(400).json({ success: false, message: 'Invalid type.' });
    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });

    const [result] = await pool.query(
      'INSERT INTO expense_items (user_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, description.trim(), Number(amount), type, category, date]
    );

    const [rows] = await pool.query('SELECT * FROM expense_items WHERE id = ?', [result.insertId]);
    await logActivity(req.user.id, 'create', `Added ${type}: ${description.trim()}`);

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to create entry.', error: err.message });
  }
});

// ── UPDATE: PUT /api/entries/:id ───────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date } = req.body;
    const { id } = req.params;

    if (!description || !amount || !type || !category || !date)
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (!VALID_TYPES.includes(type))
      return res.status(400).json({ success: false, message: 'Invalid type.' });
    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    if (isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });

    // Ensure the entry belongs to the requesting user
    const [result] = await pool.query(
      'UPDATE expense_items SET description=?, amount=?, type=?, category=?, date=? WHERE id=? AND user_id=?',
      [description.trim(), Number(amount), type, category, date, id, req.user.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Entry not found.' });

    const [rows] = await pool.query('SELECT * FROM expense_items WHERE id = ?', [id]);
    await logActivity(req.user.id, 'update', `Updated ${type}: ${description.trim()}`);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Failed to update entry.', error: err.message });
  }
});

// ── DELETE: DELETE /api/entries/:id ───────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // Get description before deleting for the activity log
    const [items] = await pool.query(
      'SELECT description, type FROM expense_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (items.length === 0)
      return res.status(404).json({ success: false, message: 'Entry not found.' });

    await pool.query(
      'DELETE FROM expense_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    await logActivity(req.user.id, 'delete', `Deleted ${items[0].type}: ${items[0].description}`);
    res.json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete entry.', error: err.message });
  }
});

module.exports = router;
