import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AccessDeniedPage() {
  const { user, role } = useAuth();

  return (
    <div className="access-denied-page">
      <div className="access-denied-card">
        <div className="denied-icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <span className="denied-code">403 FORBIDDEN</span>
        <h1 className="denied-title">Administrative Access Restricted</h1>
        <p className="denied-desc">
          You are currently signed in as <strong>{user?.name || user?.username}</strong> with the <strong>{role?.toUpperCase()}</strong> role.
          Administrative management features are exclusively reserved for verified editorial curators.
        </p>

        <div className="denied-actions">
          <Link to="/account" className="btn-denied-primary">
            Go to My Account
          </Link>
          <Link to="/" className="btn-denied-secondary">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
