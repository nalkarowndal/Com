import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import AccessDeniedPage from '../../pages/auth/AccessDeniedPage';

export default function ProtectedRoute({ allowedRoles = null, children = null }) {
  const { role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading-screen" role="status" aria-live="polite">
        <LoadingSpinner />
        <p className="auth-loading-text">Verifying authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <AccessDeniedPage />;
  }

  return children ? children : <Outlet />;
}
