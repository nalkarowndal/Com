import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchArticles, apiAdminDeleteArticle } from '../../services/api';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchArticles({ limit: 100 });
      setArticles(res.items || []);
    } catch (err) {
      console.error('Failed to load articles in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id, title) => {
    try {
      await apiAdminDeleteArticle(id);
      setActionMessage(`Monograph "${title}" was successfully deleted.`);
      setDeleteConfirmId(null);
      await loadData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesCat = filterCat === 'all' || a.categorySlug === filterCat;
    const matchesQuery = !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="admin-articles-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Monograph Management</h1>
          <p className="admin-view-desc">
            Create, edit, curate, and archive editorial stories across all four disciplines.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/articles/new" className="btn-admin-primary">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="admin-alert-success" role="alert">
          {actionMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title, author, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-select">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="architecture">Architecture</option>
            <option value="travel">Travel</option>
            <option value="art">Art</option>
            <option value="food">Food</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="admin-page-loading">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title & Slug</th>
                <th>Category</th>
                <th>Author</th>
                <th>Views</th>
                <th>Status</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="article-title-cell">
                        <strong>{article.title}</strong>
                        <span className="slug-hint">/stories/{article.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{article.categorySlug?.toUpperCase()}</span>
                    </td>
                    <td>{article.author || '—'}</td>
                    <td>{article.views?.toLocaleString() || 0}</td>
                    <td>
                      <span className={`status-tag ${article.isPublished !== false ? 'published' : 'draft'}`}>
                        {article.isPublished !== false ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      {article.isDemo ? (
                        <span className="type-badge demo">Demo</span>
                      ) : (
                        <span className="type-badge core">Core Archive</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/stories/${article.slug}`}
                          target="_blank"
                          className="btn-action-view"
                          title="View live article"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/articles/${article.id}/edit`}
                          className="btn-action-edit"
                          title="Edit article"
                        >
                          Edit
                        </Link>
                        {deleteConfirmId === article.id ? (
                          <div className="confirm-delete-box">
                            <button
                              type="button"
                              className="btn-confirm-yes"
                              onClick={() => handleDelete(article.id, article.title)}
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
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => setDeleteConfirmId(article.id)}
                            title="Delete article"
                            disabled={article.id === 'hero-urban-strorkes'}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    No monographs found matching query.
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
