import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { apiAdminGetUsers, apiAdminUpdateUserStatus, apiAdminDeleteUser } from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      try {
        const res = await apiAdminGetUsers({ role: filterRole, search: searchQuery, limit: 100 });
        if (isMounted) setUsers(res.users || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUsers();
    return () => { isMounted = false; };
  }, [filterRole, searchQuery, refreshKey]);

  const handleToggleStatus = async (user) => {
    try {
      const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
      await apiAdminUpdateUserStatus(user.id, { status: nextStatus });
      setActionMessage(`User @${user.username} status set to ${nextStatus}.`);
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDeleteUser = async (id, username) => {
    try {
      await apiAdminDeleteUser(id);
      setActionMessage(`User @${username} was removed.`);
      setDeleteConfirmId(null);
      setRefreshKey((k) => k + 1);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="admin-articles-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">User & Role Management</h1>
          <p className="admin-view-desc">
            Monitor registered platform readers, assign access roles, and audit account statuses.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="admin-alert-banner success" role="status">
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box">
          <input
            type="search"
            placeholder="Search by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-select">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="user">Readers (USER)</option>
            <option value="admin">Administrators (ADMIN)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-page-loading">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatar || '/images/avatars/user.svg'}
                          alt={u.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        />
                        <div>
                          <strong>{u.name || u.username}</strong>
                          <div className="slug-hint">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-pill ${u.role === 'admin' ? 'original' : 'category-pill'}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${u.status === 'active' ? 'approved' : 'original'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td>
                      <div className="row-actions">
                        {u.id !== 'usr-admin-001' && (
                          <button
                            type="button"
                            className="btn-action edit"
                            onClick={() => handleToggleStatus(u)}
                            title="Toggle active status"
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {u.id !== 'usr-admin-001' && (
                          deleteConfirmId === u.id ? (
                            <span className="confirm-delete-group">
                              <button
                                type="button"
                                className="btn-confirm-yes"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                className="btn-confirm-no"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                No
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-action delete"
                              onClick={() => setDeleteConfirmId(u.id)}
                            >
                              Delete
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

