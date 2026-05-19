import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login       from './components/Auth/Login';
import Register    from './components/Auth/Register';
import Dashboard   from './components/Dashboard/Dashboard';
import AdminPanel  from './components/Admin/AdminPanel';
import Navbar      from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {/* Show Navbar only when logged in */}
      {user && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

        {/* Protected — any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* Protected — admin only */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
      </Routes>
    </>
  );
}
