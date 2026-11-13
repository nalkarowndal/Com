import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import MobileNav from './MobileNav';
import { useAuth } from '../../hooks/useAuth';

export default function Header({
  brandLogoSrc = '/images/logo.png',
  brandLogoAlt = 'Logo',
  navigation = [
    { id: 'nav-arch', label: 'Architecture', href: '/architecture' },
    { id: 'nav-travel', label: 'Travel', href: '/travel' },
    { id: 'nav-art', label: 'Art', href: '/art' },
    { id: 'nav-food', label: 'Food', href: '/food' }
  ]
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { user, role, isAuthenticated, isLoading, logout } = useAuth();

  // Handle outside click and escape key to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

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

            {/* Auth Slot: Loading / Guest / User / Admin */}
            {isLoading ? (
              <div className="auth-badge-skeleton" aria-hidden="true" />
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="auth-badge-btn login-btn"
                title="Sign in to PRISM"
                aria-label="Sign In"
              >
                <span>LOGIN</span>
              </Link>
            ) : role === 'admin' ? (
              <div className="header-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="auth-badge-btn admin-badge-btn"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Admin Dashboard Menu"
                >
                  <span className="badge-role-dot admin-dot" />
                  <span>ADMIN DASHBOARD</span>
                  <svg
                    className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="header-dropdown-menu" role="menu" aria-label="Admin Options">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{user?.name || user?.username}</span>
                      <span className="dropdown-user-badge admin">Administrator</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/admin/dashboard"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      <span>관리자 대시보드</span>
                    </Link>
                    <Link
                      to="/admin/articles"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      <span>기사 관리</span>
                    </Link>
                    <Link
                      to="/admin/media"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span>이미지 관리</span>
                    </Link>
                    <Link
                      to="/admin/categories"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      <span>카테고리 관리</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <span>사용자 관리</span>
                    </Link>
                    <Link
                      to="/account"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>계정 정보</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item dropdown-logout-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="auth-badge-btn user-badge-btn"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User Account Menu"
                >
                  <span className="badge-role-dot user-dot" />
                  <span>MY ACCOUNT</span>
                  <svg
                    className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`}
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="header-dropdown-menu" role="menu" aria-label="Account Options">
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{user?.name || user?.username}</span>
                      <span className="dropdown-user-badge user">PRISM Reader</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/account"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span>내 계정</span>
                    </Link>
                    <Link
                      to="/account/settings"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      <span>계정 정보 수정</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item dropdown-logout-btn"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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
