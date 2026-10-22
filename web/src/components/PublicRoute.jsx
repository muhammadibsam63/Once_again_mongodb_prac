import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // Already logged in → send to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
