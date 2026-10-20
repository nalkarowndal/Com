import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { apiAdminGetStats, apiAdminGetAuditLogs } from '../../services/api';

export default function AdminDashboardPage() {
  const { currentUser } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        const [statsData, logsData] = await Promise.all([
          apiAdminGetStats(),
          apiAdminGetAuditLogs()
        ]);
        if (isMounted) {
          setStats(statsData);
          setAuditLogs(logsData);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="admin-page-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Editorial Intelligence Dashboard</h1>
          <p className="admin-view-desc">
            Welcome back, {currentUser?.username || 'Editor'}. Overview of published monographs, active media assets, and curator audit trails.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/articles/new" className="btn-admin-primary">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Write New Monograph</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap bg-blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Articles</span>
            <span className="metric-value">{stats?.totalArticles ?? 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-green">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Disciplines</span>
            <span className="metric-value">{stats?.totalCategories ?? 4}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-gold">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Gallery Works</span>
            <span className="metric-value">{stats?.totalGalleryItems ?? 4}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap bg-purple">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Engagements</span>
            <span className="metric-value">{stats?.totalViews?.toLocaleString() ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Quick Actions */}
      <div className="admin-dual-panel">
        <div className="panel-box">
          <h2 className="panel-title">Monographs by Discipline</h2>
          <div className="category-counts-list">
            {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="cat-count-row">
                <span className="cat-name">{cat.toUpperCase()}</span>
                <span className="cat-pill">{count} articles</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-box">
          <h2 className="panel-title">Editorial Actions</h2>
          <div className="quick-actions-list">
            <Link to="/admin/articles" className="quick-action-item">
              <div className="action-meta">
                <strong>Manage Monographs</strong>
                <span>Review published articles, edit abstracts, or publish drafts.</span>
              </div>
              <span className="action-arrow">&rarr;</span>
            </Link>
            <Link to="/admin/media" className="quick-action-item">
              <div className="action-meta">
                <strong>Media Repository</strong>
                <span>Inspect permanent architectural photography and asset metadata.</span>
              </div>
              <span className="action-arrow">&rarr;</span>
            </Link>
            <Link to="/admin/settings" className="quick-action-item">
              <div className="action-meta">
                <strong>System Integrity</strong>
                <span>Verify persistent storage engine and audit cryptographic health.</span>
              </div>
              <span className="action-arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-audit-section">
        <h2 className="panel-title">Curator Audit Trail</h2>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Curator</th>
                <th>Operation</th>
                <th>Target Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? (
                auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="log-time">{new Date(log.timestamp).toLocaleString()}</td>
                    <td><span className="actor-tag">{log.actor}</span></td>
                    <td><span className={`action-badge action-${log.action.toLowerCase()}`}>{log.action}</span></td>
                    <td className="entity-cell">{log.entity} {log.entityId ? `(#${log.entityId})` : ''}</td>
                    <td className="details-cell">
                      {typeof log.details === 'object' && log.details !== null
                        ? JSON.stringify(log.details)
                        : String(log.details || '—')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table-cell">No administrative mutations recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
