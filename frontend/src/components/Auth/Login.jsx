import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate           = useNavigate();
  const [form, setForm]    = useState({ email: '', password: '' });
  const [error, setError]  = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>💰 Expense Tracker</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field mt-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field mt-2">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full mt-3"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>

        {/* Demo credentials hint */}
        <div style={styles.hint}>
          <strong>Demo:</strong> admin@example.com / admin123<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;john@example.com / user123
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    padding: 16,
  },
  box: {
    background: '#ffffff',
    borderRadius: 10,
    boxShadow: '0 2px 16px rgba(44,62,80,0.12)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#2c3e50',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.9rem',
    marginTop: 4,
    marginBottom: 20,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '0.88rem',
    color: '#6b7280',
  },
  link: {
    color: '#2c3e50',
    fontWeight: 600,
  },
  hint: {
    marginTop: 16,
    padding: '10px 12px',
    background: '#f1f5f9',
    borderRadius: 6,
    fontSize: '0.8rem',
    color: '#6b7280',
    lineHeight: 1.8,
  },
};
