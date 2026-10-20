import { useState } from 'react';
import MobileNav from './MobileNav';

export default function Header({
  brandLogoSrc = '/images/logo.png',
  brandLogoAlt = 'Logo',
  navigation = [
    { id: 'nav-arch', label: 'Architecture', href: '#' },
    { id: 'nav-travel', label: 'Travel', href: '#' },
    { id: 'nav-art', label: 'Art', href: '#' },
    { id: 'nav-food', label: 'Food', href: '#' }
  ],
  onOpenAdmin
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  return (
    <>
      <header className="site-header">
        <div className="row header-inner">
          <a
            href="#"
            className="logo-link"
            aria-label="PRISM Home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src={brandLogoSrc}
              alt={brandLogoAlt}
              className="style-logo"
              width="132"
              height="30"
            />
          </a>

          <nav className="style-nav" aria-label="Main Navigation">
            <ul>
              {navigation.map((item) => (
                <li key={item.id || item.label}>
                  <a
                    href={item.href || '#'}
                    className={activeItem === item.label ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveItem(item.label);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            {onOpenAdmin && (
              <button
                type="button"
                className="admin-badge-btn"
                onClick={onOpenAdmin}
                title="Manage site content"
                aria-label="Open Admin Content Manager"
              >
                <span>Admin</span>
              </button>
            )}

            <button
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
      />
    </>
  );
}
