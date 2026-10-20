import { useState, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import MobileNav from './MobileNav';

export default function Header({
  brandLogoSrc = '/images/logo.png',
  brandLogoAlt = 'Logo',
  navigation = [
    { id: 'nav-arch', label: 'Architecture', href: '/architecture' },
    { id: 'nav-travel', label: 'Travel', href: '/travel' },
    { id: 'nav-art', label: 'Art', href: '/art' },
    { id: 'nav-food', label: 'Food', href: '/food' }
  ],
  onOpenAdmin
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const navigate = useNavigate();

  return (
    <>
      <header className="site-header">
        <div className="row header-inner">
          <Link
            to="/"
            className="logo-link"
            aria-label="PRISM Home"
          >
            <img
              src={brandLogoSrc}
              alt={brandLogoAlt}
              className="style-logo"
              width="132"
              height="30"
            />
          </Link>

          <nav className="style-nav" aria-label="Main Navigation">
            <ul>
              {navigation.map((item) => {
                const targetHref = item.href && item.href !== '#'
                  ? item.href
                  : `/${item.label.toLowerCase()}`;
                return (
                  <li key={item.id || item.label}>
                    <NavLink
                      to={targetHref}
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
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Gallery
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <Link
              to="/search"
              className="search-header-btn"
              title="Search editorial collection"
              aria-label="Search collection"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            <button
              type="button"
              className="admin-badge-btn"
              onClick={() => {
                if (onOpenAdmin) {
                  onOpenAdmin();
                } else {
                  navigate('/admin/dashboard');
                }
              }}
              title="Manage site content"
              aria-label="Open Admin Dashboard"
            >
              <span>Admin</span>
            </button>

            <button
              ref={toggleBtnRef}
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation"
              aria-label="Toggle navigation menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        navigation={navigation}
        triggerRef={toggleBtnRef}
      />
    </>
  );
}
