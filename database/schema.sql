-- Author: Sarthak Goyal
-- ─────────────────────────────────────────────────────────────────
-- Personal Expense Tracker V2 — MySQL Schema
-- Run this entire file in MySQL Workbench to set up the database.
-- ─────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS expensetracker_v2;
USE expensetracker_v2;

-- ── Entity 1: users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Entity 2: expense_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_items (
    id          INT           AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    description VARCHAR(200)  NOT NULL,
    amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    type        ENUM('income','expense') NOT NULL,
    category    ENUM('salary','groceries','utilities','entertainment','other') NOT NULL,
    date        DATE          NOT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Entity 3: user_activity ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
    id         INT           AUTO_INCREMENT PRIMARY KEY,
    user_id    INT           NOT NULL,
    action     VARCHAR(50)   NOT NULL,
    details    VARCHAR(255)  DEFAULT NULL,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Sample admin user (password: admin123) ────────────────────────
-- bcrypt hash of 'admin123' with 10 rounds
INSERT INTO expensetracker_v2.users (username, email, password_hash, role) VALUES
('admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ── Sample regular user (password: user123) ───────────────────────
INSERT INTO expensetracker_v2.users (username, email, password_hash, role) VALUES
('johndoe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- ── Sample expense items for johndoe (user_id = 2) ────────────────
INSERT INTO expensetracker_v2.expense_items (user_id, description, amount, type, category, date) VALUES
(2, 'Monthly Salary',      5000.00, 'income',  'salary',        '2026-01-01'),
(2, 'Weekly Grocery Run',   120.50, 'expense', 'groceries',     '2026-01-05'),
(2, 'Electricity Bill',      95.00, 'expense', 'utilities',     '2026-01-10'),
(2, 'Netflix Subscription',  22.99, 'expense', 'entertainment', '2026-01-15'),
(2, 'Monthly Salary',      5000.00, 'income',  'salary',        '2026-02-01'),
(2, 'Grocery Shopping',     145.75, 'expense', 'groceries',     '2026-02-08'),
(2, 'Internet Bill',         59.99, 'expense', 'utilities',     '2026-02-12'),
(2, 'Concert Tickets',      180.00, 'expense', 'entertainment', '2026-02-20'),
(2, 'Freelance Payment',    800.00, 'income',  'other',         '2026-03-05'),
(2, 'Supermarket',          200.00, 'expense', 'groceries',     '2026-03-10');

-- ── Sample activity log ───────────────────────────────────────────
INSERT INTO expensetracker_v2.user_activity (user_id, action, details) VALUES
(2, 'login',  'User logged in'),
(2, 'create', 'Added expense: Monthly Salary'),
(2, 'create', 'Added expense: Weekly Grocery Run'),
(2, 'logout', 'User logged out');
