import axios from 'axios';

/**
 * Centralised Axios instance.
 * Automatically attaches the JWT from localStorage to every request header.
 * Handles 401 responses by clearing the stored token.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — clear stale tokens on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
