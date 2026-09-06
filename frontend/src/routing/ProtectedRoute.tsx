import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { type UserRole, roleHomePath } from './helpers';

/** Wraps an authenticated layout; redirects unauthenticated users to /login. */
export const ProtectedRoute = ({ role }: { role: UserRole }) => {
  const { isAuthenticated, status, user } = useAuth();

  if (status === 'loading') {
    return <div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Checking session…</span></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    // Authenticated but wrong role → send to role home.
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  return <Outlet />;
};
