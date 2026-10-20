import { useEffect } from 'react';

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
            {navigation.map((item) => (
              <li key={item.id || item.label}>
                <a
                  href={item.href || '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
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
