import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AccountPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Active Member';

  return (
    <div className="account-page-container">
      <div className="account-hero">
        <div className="account-profile-header">
          <div className="account-avatar-wrap">
            <img
              src={user?.avatar || '/images/avatars/user.svg'}
              alt={user?.name || user?.username}
              className="account-avatar-img"
              width="80"
              height="80"
            />
            <span className={`account-role-pill ${role}`}>{role?.toUpperCase()}</span>
          </div>

          <div className="account-details">
            <h1 className="account-name">{user?.name || user?.username}</h1>
            <p className="account-username">@{user?.username}</p>
            <p className="account-email">{user?.email}</p>
            <p className="account-joined">Member since {formattedDate}</p>
          </div>

          <div className="account-actions-header">
            <Link to="/account/settings" className="btn-account-edit">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Edit Profile</span>
            </Link>
            <button type="button" onClick={handleLogout} className="btn-account-logout">
              Sign Out
            </button>
          </div>
        </div>

        {role === 'admin' && (
          <div className="admin-privilege-banner">
            <div className="banner-content">
              <strong>Administrative Access Enabled</strong>
              <p>You have full editorial curation and content management privileges.</p>
            </div>
            <Link to="/admin/dashboard" className="btn-banner-dashboard">
              Go to Admin Dashboard &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="account-content-grid">
        <section className="account-card" aria-labelledby="heading-membership">
          <h2 id="heading-membership" className="section-title">Membership Status</h2>
          <div className="membership-info">
            <div className="info-row">
              <span className="info-label">Account Type</span>
              <span className="info-value">{role === 'admin' ? 'Chief Editorial Curator' : 'Standard Reader'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className="info-value status-active">Active & Verified</span>
            </div>
            <div className="info-row">
              <span className="info-label">Security Protocol</span>
              <span className="info-value">scrypt + HMAC-SHA256 Sessions</span>
            </div>
          </div>
        </section>

        <section className="account-card" aria-labelledby="heading-quicklinks">
          <h2 id="heading-quicklinks" className="section-title">Curated Quick Access</h2>
          <div className="quick-links-list">
            <Link to="/architecture" className="quick-link-item">
              <span>Architecture Collection</span>
              <span>&rarr;</span>
            </Link>
            <Link to="/gallery" className="quick-link-item">
              <span>PRISM Photo Gallery</span>
              <span>&rarr;</span>
            </Link>
            <Link to="/search" className="quick-link-item">
              <span>Editorial Search Archive</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
