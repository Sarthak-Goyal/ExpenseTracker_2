# 💰 Personal Expense Tracker V2

A full-stack single-page application that allows users to track personal income and expenses with authentication, live search, and an admin dashboard.

---

## Problem Statement

Managing personal finances without proper tooling leads to overspending and poor visibility into monthly trends. This app solves that by providing a secure, multi-user platform where individuals can log and categorise transactions, visualise monthly trends, and administrators can monitor all user activity in real time.

---

## Technical Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 18 + Vite                                        |
| Routing    | React Router v6 (client-side SPA routing)              |
| State      | React Context API + useState / useCallback / useRef    |
| HTTP       | Axios (with JWT request interceptor + AbortController) |
| Charts     | Chart.js + react-chartjs-2                             |
| Styling    | Custom CSS (3-colour muted palette, CSS variables)     |
| Backend    | Node.js + Express.js                                   |
| Auth       | JWT (jsonwebtoken) + bcryptjs password hashing         |
| Database   | MySQL (via mysql2 connection pool)                     |
| Dev server | Vite proxy → Express (no CORS issues in dev)           |

---

## Features

- **User authentication** — register, login, logout with JWT + bcrypt password hashing
- **Role-based access** — regular users see their own data; admins access the admin panel
- **Full CRUD** on all three entities (users, expense_items, user_activity)
- **Live search** — search bar filters expense entries in real-time as you type with debouncing and AbortController to prevent flickering
- **Filters** — filter entries by type (income/expense) and category simultaneously
- **Summary cards** — live totals for income, expenses, and balance
- **Monthly trends chart** — grouped bar chart of income vs expenses per month (Chart.js)
- **New entry highlight** — when an entry is added it appears at the top of the list with a solid green background and NEW badge for 5 seconds before sorting into its correct date position
- **Admin panel** — view all users, promote/demote roles, delete accounts, view full activity log
- **Clickable usernames in admin** — clicking a username in the Users tab redirects directly to that user's filtered activity log
- **Activity logging** — every login, logout, register, create, update, delete is recorded automatically
- **Responsive navbar** — full navigation bar on laptop/desktop screens (above 768px); hamburger dropdown menu on mobile screens (below 768px)
- **Input validation** — client-side and server-side on all forms
- **JWT interceptor** — Axios automatically attaches the token to every request
- **Protected routes** — React Router redirects unauthenticated and unauthorised users
- **Responsive design** — works on mobile and desktop

---

## Folder Structure

```
ExpenseTrackerV2/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT verification + admin-only middleware
│   ├── routes/
│   │   ├── auth.js          # POST /register, /login, /logout, GET /me
│   │   ├── entries.js       # CRUD for expense_items (protected)
│   │   └── admin.js         # User management + activity log (admin only)
│   ├── db.js                # MySQL connection pool
│   └── server.js            # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx           # Login page
│   │   │   │   └── Register.jsx        # Register page
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx          # Responsive navbar — desktop links or mobile hamburger dropdown
│   │   │   │   └── ProtectedRoute.jsx  # Route guard component
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx       # Main user page — live search with AbortController, new entry flash logic
│   │   │   │   ├── EntryForm.jsx       # Add/edit modal form
│   │   │   │   ├── EntryTable.jsx      # Entries table — NEW badge and green highlight for new entries
│   │   │   │   ├── SummaryCards.jsx    # Income/expense/balance cards
│   │   │   │   └── TrendsChart.jsx     # Monthly bar chart
│   │   │   └── Admin/
│   │   │       └── AdminPanel.jsx      # Admin users + activity tabs with clickable username filter
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state (login, logout, register)
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance with JWT interceptor
│   │   ├── App.jsx                     # Route definitions
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles (3-colour palette)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Vite dev server + API proxy
│
├── database/
│   └── schema.sql            # All tables + sample data
│
├── .env.example              # Required environment variables template
├── .gitignore
├── package.json              # Backend dependencies
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+ — https://nodejs.org/
- MySQL Server + MySQL Workbench — https://dev.mysql.com/downloads/

### Setup Steps

**1. Set up the database**

Open MySQL Workbench → open `database/schema.sql` → click ⚡ to run.
This creates the `expensetracker_v2` database with all tables and sample data.

**2. Create your .env file**

Copy `.env.example` to `.env` in the root folder and fill in your credentials:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=expensetracker_v2
JWT_SECRET=any_long_random_string_here
```

**3. Install backend dependencies**

```bash
npm install
```

**4. Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

**5. Start the backend**

```bash
npm run dev
```

**6. Start the frontend (in a second terminal)**

```bash
cd frontend
npm run dev
```

**7. Open in browser**

```
http://localhost:5173
```

Demo credentials:

- Admin: `admin@example.com` / `admin123`
- User: `john@example.com` / `user123`

---

## Workload Allocation

This project was completed individually. The full codebase is the work of a single author.

| Area                | Files                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| Database design     | `database/schema.sql`                                                  |
| Backend auth        | `backend/routes/auth.js`, `backend/middleware/auth.js`                 |
| Backend CRUD        | `backend/routes/entries.js`                                            |
| Backend admin       | `backend/routes/admin.js`                                              |
| Backend server + DB | `backend/server.js`, `backend/db.js`                                   |
| React auth pages    | `frontend/src/components/Auth/Login.jsx`, `Register.jsx`               |
| React layout        | `frontend/src/components/Layout/Navbar.jsx`, `ProtectedRoute.jsx`      |
| React dashboard     | `frontend/src/components/Dashboard/` (all 5 files)                     |
| React admin panel   | `frontend/src/components/Admin/AdminPanel.jsx`                         |
| Global state + API  | `frontend/src/context/AuthContext.jsx`, `frontend/src/services/api.js` |
| Styling             | `frontend/src/index.css`                                               |

---

## Challenges Overcome

Implementing JWT authentication end-to-end required careful coordination between the backend token signing and the frontend Axios interceptor — particularly ensuring the token is re-injected on every request after a page refresh, which was solved by reading from localStorage inside the interceptor rather than from React state. Eliminating live search flickering required two techniques working together — a debounced two-stage search state so the API is only called after the user stops typing, and an AbortController that cancels the previous in-flight request before starting a new one, ensuring stale responses can never overwrite fresh results. The responsive navbar required using window.innerWidth with a resize event listener rather than CSS media queries because inline React styles have higher specificity than stylesheets and would have overridden any CSS-based hide/show logic. Building the new entry highlight required coordinating between Dashboard and EntryTable — Dashboard injects the entry at the top immediately with an isNew flag and clears it after 5 seconds using a useRef-managed timer, while EntryTable reads the flag to apply a solid green background and NEW badge via a CSS before pseudo-element. Designing the role-based access control required two separate middleware functions applied in sequence on admin routes, with explicit checks preventing admins from modifying their own role or deleting their own account.
