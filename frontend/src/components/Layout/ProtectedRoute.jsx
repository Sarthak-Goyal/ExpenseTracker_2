import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute wraps routes that require authentication.
 * If adminOnly is true, also checks that the user has the admin role.
 */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}
