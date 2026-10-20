import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiAdminGetMe, apiAdminLogout } from '../services/api';

export default function AdminLayout() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const user = await apiAdminGetMe();
        if (isMounted) {
          if (!user) {
            navigate('/admin/login', { replace: true, state: { from: location.pathname } });
          } else {
            setCurrentUser(user);
          }
        }
      } catch {
        if (isMounted) {
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();
    return () => { isMounted = false; };
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await apiAdminLogout();
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <LoadingSpinner />
        <p>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="admin-dashboard-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar" aria-label="Admin Navigation">
        <div className="admin-brand">
          <Link to="/" className="admin-brand-link">
            <span className="brand-dot" />
            <span className="brand-text">PRISM ADMIN</span>
          </Link>
          <span className="admin-role-badge">{currentUser.role || 'Superuser'}</span>
        </div>

        <nav className="admin-nav-menu">
          <ul>
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/articles" className={({ isActive }) => (isActive ? 'active' : '')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Articles</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>Categories</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/media" className={({ isActive }) => (isActive ? 'active' : '')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Media Assets</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>System</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="btn-view-site" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span>View Public Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div className="topbar-left">
            <span className="platform-tag">PRISM Editorial CMS v2.0</span>
          </div>

          <div className="topbar-right">
            <span className="user-greeting">Signed in as <strong>{currentUser.username}</strong></span>
            <button
              type="button"
              className="btn-admin-logout"
              onClick={handleLogout}
              aria-label="Sign out from admin"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="admin-page-content">
          <Outlet context={{ currentUser }} />
        </main>
      </div>
    </div>
  );
}
