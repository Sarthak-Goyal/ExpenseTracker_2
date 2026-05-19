import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Mobile breakpoint — screens narrower than this show the hamburger menu.
// 768px = phones and small tablets. Laptops are typically 1024px+.
const MOBILE_BREAKPOINT = 768;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  // Detect screen width using JS so inline styles don't fight with CSS classes
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const menuRef = useRef(null);

  // Update isMobile whenever the window is resized
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false); // auto-close if user widens window
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when route changes
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close dropdown when clicking outside the navbar
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav} ref={menuRef}>
      <div style={styles.inner}>

        <Link to="/" style={styles.brand}>Expense Tracker</Link>

        {/* Desktop links — only rendered on laptop/desktop screens */}
        {!isMobile && (
          <div style={styles.links}>
            <Link to="/" style={{ ...styles.link, ...(location.pathname === '/' ? styles.activeLink : {}) }}>
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ ...styles.link, ...(location.pathname === '/admin' ? styles.activeLink : {}) }}>
                Admin
              </Link>
            )}
            <span style={styles.username}>{user?.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}

        {/* Hamburger button — only rendered on mobile screens */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            style={styles.hamburger}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
            <span style={styles.bar}></span>
          </button>
        )}
      </div>

      {/* Mobile dropdown — only visible when menu is open on mobile */}
      {isMobile && menuOpen && (
        <div style={styles.dropdown}>
          <Link
            to="/"
            style={{ ...styles.dropdownLink, ...(location.pathname === '/' ? styles.dropdownActive : {}) }}
          >
            Dashboard
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              style={{ ...styles.dropdownLink, ...(location.pathname === '/admin' ? styles.dropdownActive : {}) }}
            >
              Admin Panel
            </Link>
          )}
          <div style={styles.dropdownDivider} />
          <span style={styles.dropdownUser}>Signed in as {user?.username}</span>
          <button onClick={handleLogout} style={styles.dropdownLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    background: '#2c3e50',
    boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '0 16px',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#f1f5f9',
    fontWeight: 700,
    fontSize: '1.05rem',
    textDecoration: 'none',
    letterSpacing: '-0.3px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  link: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  activeLink: { color: '#f1f5f9' },
  username:   { color: '#9ca3af', fontSize: '0.85rem' },
  logoutBtn: {
    background: 'transparent',
    border: '1.5px solid #6b7280',
    color: '#9ca3af',
    padding: '5px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'border-color 0.15s, color 0.15s',
  },

  // Hamburger button
  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 5,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: 4,
  },
  bar: {
    display: 'block',
    width: 22,
    height: 2,
    background: '#f1f5f9',
    borderRadius: 2,
  },

  // Mobile dropdown
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    background: '#243342',
    boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    zIndex: 99,
  },
  dropdownLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  dropdownActive: {
    color: '#f1f5f9',
    background: 'rgba(255,255,255,0.06)',
  },
  dropdownDivider: {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '8px 0',
  },
  dropdownUser: {
    color: '#6b7280',
    padding: '6px 20px',
    fontSize: '0.82rem',
  },
  dropdownLogout: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    padding: '12px 20px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
};
