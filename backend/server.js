// Author: Sarthak Goyal
const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const authRouter    = require('./routes/auth');
const entriesRouter = require('./routes/entries');
const adminRouter   = require('./routes/admin');
const pool          = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth',    authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/admin',   adminRouter);

// ── Serve built React app in production ───────────────────────────
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Connect to MySQL then start ────────────────────────────────────
pool.getConnection()
  .then(conn => {
    conn.release();
    console.log('✅ Connected to MySQL');
    app.listen(PORT, () => console.log(`🚀 Backend running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err.message);
    console.error('   → Check your .env credentials and make sure MySQL is running.');
    process.exit(1);
  });
