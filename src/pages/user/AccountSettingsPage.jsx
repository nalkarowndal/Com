import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AccountSettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [passErr, setPassErr] = useState(null);
  const [savingPass, setSavingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    setSavingProfile(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase()
      });
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg(null);
    setPassErr(null);

    if (newPassword !== confirmPassword) {
      setPassErr('New passwords do not match');
      return;
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPassErr('New password must be at least 8 characters with letters and numbers');
      return;
    }

    setSavingPass(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setPassMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassErr(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="account-settings-container">
      <div className="settings-header">
        <Link to="/account" className="back-link">&larr; Back to My Account</Link>
        <h1 className="settings-title">Account Settings</h1>
        <p className="settings-desc">Manage your profile details and credential security.</p>
      </div>

      <div className="settings-sections">
        {/* Profile Details Form */}
        <section className="settings-card" aria-labelledby="heading-profile">
          <h2 id="heading-profile" className="card-title">Profile Information</h2>

          {profileMsg && <div className="alert-success" role="status">{profileMsg}</div>}
          {profileErr && <div className="alert-error" role="alert">{profileErr}</div>}

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="settings-username">Username</label>
              <input
                id="settings-username"
                type="text"
                disabled
                value={user?.username || ''}
                className="input-disabled"
              />
              <span className="input-hint">Usernames cannot be modified.</span>
            </div>

            <div className="form-group">
              <label htmlFor="settings-name">Display Name</label>
              <input
                id="settings-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your preferred name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <button type="submit" className="btn-settings-save" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="settings-card" aria-labelledby="heading-password">
          <h2 id="heading-password" className="card-title">Change Password</h2>

          {passMsg && <div className="alert-success" role="status">{passMsg}</div>}
          {passErr && <div className="alert-error" role="alert">{passErr}</div>}

          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="settings-current-pass">Current Password</label>
              <input
                id="settings-current-pass"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="settings-new-pass">New Password</label>
              <input
                id="settings-new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars (letters and numbers)"
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="settings-confirm-pass">Confirm New Password</label>
              <input
                id="settings-confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn-settings-save"
              disabled={savingPass || !currentPassword || !newPassword}
            >
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
