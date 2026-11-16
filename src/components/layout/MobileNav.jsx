import { useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MobileNav({ isOpen, onClose, navigation = [], triggerRef }) {
  const drawerRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousFocusRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { role, isAuthenticated, logout } = useAuth();

  // Auto-close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Focus trap, focus restoration, body scroll lock, Escape key, and resize cleanup
  useEffect(() => {
    if (!isOpen) return;

    const triggerEl = triggerRef?.current;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Focus the close button when opened
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 992) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      const restoreTarget = triggerEl || previousFocusRef.current;
      if (restoreTarget && typeof restoreTarget.focus === 'function') {
        restoreTarget.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/');
  };

  return (
    <>
      <div
        className={`mobile-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        id="mobile-navigation"
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="drawer-close"
          onClick={onClose}
          aria-label="Close mobile navigation menu"
        >
          ✕
        </button>

        <nav aria-label="Mobile menu">
          <ul>
            <li>
              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) => (isActive ? 'active' : '')}
                end
              >
                Home
              </NavLink>
            </li>
            {navigation.map((item) => {
              const targetHref = item.href && item.href !== '#'
                ? item.href
                : `/${item.label.toLowerCase()}`;
              return (
                <li key={item.id || item.label}>
                  <NavLink
                    to={targetHref}
                    onClick={onClose}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
            <li>
              <NavLink
                to="/gallery"
                onClick={onClose}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Gallery
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/search"
                onClick={onClose}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Search
              </NavLink>
            </li>

            {/* Auth section */}
            <li className="mobile-auth-divider" />

            {!isAuthenticated ? (
              <li>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="mobile-login-link"
                >
                  LOGIN &rarr;
                </Link>
              </li>
            ) : role === 'admin' ? (
              <>
                <li className="mobile-section-heading">ADMINISTRATION</li>
                <li>
                  <NavLink to="/admin/dashboard" onClick={onClose}>
                    Admin Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/articles" onClick={onClose}>
                    Article Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/media" onClick={onClose}>
                    Media Library
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/categories" onClick={onClose}>
                    Category Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" onClick={onClose}>
                    User Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account" onClick={onClose}>
                    Account Settings
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="mobile-section-heading">MY ACCOUNT</li>
                <li>
                  <NavLink to="/account" onClick={onClose}>
                    My Account
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/account/settings" onClick={onClose}>
                    Account Settings
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="mobile-drawer-footer">
          <p>HBK Editorial Collection</p>
          <p>2026 Green Systems Incorporated.</p>
        </div>
      </div>
    </>
  );
}
