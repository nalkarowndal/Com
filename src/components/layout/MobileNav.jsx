import { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function MobileNav({ isOpen, onClose, navigation = [] }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`mobile-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="mobile-navigation"
        className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          className="drawer-close"
          onClick={onClose}
          aria-label="Close mobile navigation menu"
        >
          ✕
        </button>

        <nav>
          <ul>
            <li>
              <NavLink
                to="/"
                onClick={onClose}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                Home
              </NavLink>
            </li>
            {navigation.map((item) => (
              <li key={item.id || item.label}>
                <NavLink
                  to={item.href || `/${item.label.toLowerCase()}`}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
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
            <li style={{ marginTop: '16px' }}>
              <Link
                to="/admin/dashboard"
                onClick={onClose}
                style={{ color: 'var(--color-accent-champagne)' }}
              >
                Admin Panel &rarr;
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mobile-drawer-footer">
          <p>PRISM Editorial Collection</p>
          <p>2026 Green Systems Incorporated.</p>
        </div>
      </div>
    </>
  );
}
