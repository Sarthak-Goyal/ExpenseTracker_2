// Author: Sarthak Goyal
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and supplies authentication state
 * (current user, login, logout, register) to every component via context.
 */
export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  /** Register a new account */
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { username, email, password });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Log in with email + password, store JWT and user in localStorage */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Log out — call the logout endpoint then clear local storage */
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — use inside any component to access auth state */
export function useAuth() {
  return useContext(AuthContext);
}
