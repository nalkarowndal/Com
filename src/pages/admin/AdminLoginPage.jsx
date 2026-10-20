import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiAdminLogin } from '../../services/api';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminSecurePassword2026!');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiAdminLogin(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-header">
          <Link to="/" className="login-logo-link">
            <img src="/images/logo.png" alt="PRISM Brand" width="120" />
          </Link>
          <h1 className="login-title">Editorial Management Portal</h1>
          <p className="login-subtitle">
            Authenticated administrative access for PRISM content curators and editors.
          </p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="login-username">Curator Account</label>
            <input
              id="login-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Access Key / Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">
            <strong>Security Notice:</strong> Passwords are cryptographically verified using scrypt with timing-safe comparisons.
          </p>
          <Link to="/" className="login-back-home">&larr; Return to Public Website</Link>
        </div>
      </div>
    </div>
  );
}
