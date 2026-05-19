// Author: Sarthak Goyal
const mysql = require('mysql2/promise');

/**
 * MySQL connection pool.
 * Reuses connections for performance rather than opening a new one per request.
 */
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '1234',
  database:           process.env.DB_NAME     || 'expensetracker_v2',
  waitForConnections: true,
  connectionLimit:    10,
});

module.exports = pool;
