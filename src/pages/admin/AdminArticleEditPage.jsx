import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  fetchArticles,
  apiAdminCreateArticle,
  apiAdminUpdateArticle
} from '../../services/api';

export default function AdminArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categorySlug: 'architecture',
    badge: 'Editorial Essay',
    author: '',
    imageSrc: '/images/hero.jpg',
    excerpt: '',
    content: '',
    tags: '',
    isFeatured: false,
    isPublished: true,
    isDemo: true
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) return;

    let isMounted = true;
    async function loadArticle() {
      try {
        const res = await fetchArticles({ limit: 100 });
        const target = res.items?.find((a) => a.id === id);
        if (isMounted) {
          if (target) {
            setFormData({
              title: target.title || '',
              slug: target.slug || '',
              categorySlug: target.categorySlug || 'architecture',
              badge: target.badge || '',
              author: target.author || '',
              imageSrc: target.imageSrc || '/images/hero.jpg',
              excerpt: target.excerpt || '',
              content: target.content || '',
              tags: target.tags || '',
              isFeatured: !!target.isFeatured,
              isPublished: target.isPublished !== false,
              isDemo: !!target.isDemo
            });
          } else {
            setError(`Article #${id} not found.`);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadArticle();
    return () => { isMounted = false; };
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData((prev) => {
      const updates = { title: titleVal };
      if (isNew && !prev.slug) {
        updates.slug = titleVal
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        await apiAdminCreateArticle(formData);
      } else {
        await apiAdminUpdateArticle(id, formData);
      }
      navigate('/admin/articles');
    } catch (err) {
      setError(err.message || 'Failed to save monograph');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-article-edit-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">
            {isNew ? 'Create New Monograph' : `Edit Monograph: ${formData.title}`}
          </h1>
          <p className="admin-view-desc">
            Compose and configure article metadata, typography, and publication flags.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/articles" className="btn-admin-secondary">
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-edit-form">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="article-title">Monograph Title *</label>
            <input
              id="article-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. Sculpted Concrete Dynamics"
            />
          </div>

          <div className="form-group">
            <label htmlFor="article-slug">URL Slug *</label>
            <input
              id="article-slug"
              name="slug"
              type="text"
              required
              value={formData.slug}
              onChange={handleChange}
              placeholder="e.g. sculpted-concrete-dynamics"
            />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label htmlFor="article-category">Discipline Category *</label>
            <select
              id="article-category"
              name="categorySlug"
              value={formData.categorySlug}
              onChange={handleChange}
            >
              <option value="architecture">Architecture</option>
              <option value="travel">Travel</option>
              <option value="art">Art</option>
              <option value="food">Food</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="article-badge">Badge Label</label>
            <input
              id="article-badge"
              name="badge"
              type="text"
              value={formData.badge}
              onChange={handleChange}
              placeholder="e.g. Editor's Choice"
            />
          </div>

          <div className="form-group">
            <label htmlFor="article-author">Author / Curator</label>
            <input
              id="article-author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Sebastian Weiss"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="article-image">Cover Image Path / URL</label>
          <select
            id="article-image"
            name="imageSrc"
            value={formData.imageSrc}
            onChange={handleChange}
          >
            <option value="/images/hero.jpg">/images/hero.jpg (Architectural Facade)</option>
            <option value="/images/gallery-1.jpg">/images/gallery-1.jpg (Concrete Spiral)</option>
            <option value="/images/gallery-2.jpg">/images/gallery-2.jpg (Suspension Bridge)</option>
            <option value="/images/gallery-3.jpg">/images/gallery-3.jpg (Angular Pavilion)</option>
            <option value="/images/gallery-4.jpg">/images/gallery-4.jpg (Curved Glass Tower)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="article-excerpt">Lead Abstract / Excerpt</label>
          <textarea
            id="article-excerpt"
            name="excerpt"
            rows="3"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="A compelling 2-line summary of the architectural or editorial piece..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="article-content">Full Editorial Text (Paragraphs separated by blank lines)</label>
          <textarea
            id="article-content"
            name="content"
            rows="8"
            required
            value={formData.content}
            onChange={handleChange}
            placeholder="Write the full narrative monograph..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="article-tags">Keywords / Tags (Comma separated)</label>
          <input
            id="article-tags"
            name="tags"
            type="text"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Architecture, Minimalist, Sebastian Weiss"
          />
        </div>

        {/* Toggles */}
        <div className="form-checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            <span>Published (Visible to public)</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <span>Featured (Hero / spotlight position)</span>
          </label>

          <label className="checkbox-item">
            <input
              type="checkbox"
              name="isDemo"
              checked={formData.isDemo}
              onChange={handleChange}
            />
            <span>Demo Tag (Distinguishes sample content from core archive)</span>
          </label>
        </div>

        <div className="form-actions-bar">
          <button
            type="submit"
            className="btn-admin-submit"
            disabled={saving}
          >
            {saving ? 'Persisting to Database...' : isNew ? 'Publish Monograph' : 'Save Modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
