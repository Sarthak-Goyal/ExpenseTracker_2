// Author: Sarthak Goyal
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    const result = await register(form.username, form.email, form.password);
    if (result.success) {
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(result.message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>💰 Expense Tracker</h1>
        <p style={styles.subtitle}>Create a new account</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field mt-2">
            <label htmlFor="username">Username</label>
            <input
              id="username" name="username" type="text"
              placeholder="johndoe"
              value={form.username} onChange={handleChange} required
            />
          </div>

          <div className="field mt-2">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>

          <div className="field mt-2">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password"
              placeholder="Min. 6 characters"
              value={form.password} onChange={handleChange} required
            />
          </div>

          <div className="field mt-2">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm" name="confirm" type="password"
              placeholder="Re-enter password"
              value={form.confirm} onChange={handleChange} required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-3" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
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
  title:    { textAlign: 'center', fontSize: '1.5rem', color: '#2c3e50' },
  subtitle: { textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginTop: 4, marginBottom: 20 },
  footer:   { textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: '#6b7280' },
  link:     { color: '#2c3e50', fontWeight: 600 },
};
