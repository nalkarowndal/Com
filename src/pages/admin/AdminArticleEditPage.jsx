import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  fetchArticles,
  apiAdminCreateArticle,
  apiAdminUpdateArticle,
  apiAdminGetMedia,
  apiAdminRecommendMedia,
  apiAdminRollbackMedia
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

  const [availableMedia, setAvailableMedia] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommending, setRecommending] = useState(false);
  const [recommendNotice, setRecommendNotice] = useState(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Load available media assets from API
  useEffect(() => {
    let isMounted = true;
    async function loadMediaLibrary() {
      try {
        const res = await apiAdminGetMedia({ limit: 100 });
        if (isMounted) setAvailableMedia(res.items || []);
      } catch (err) {
        console.warn('Could not load media library:', err);
      }
    }
    loadMediaLibrary();
    return () => { isMounted = false; };
  }, []);

  // Load article data if editing
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

  const handleRecommendMedia = async () => {
    if (!formData.title && !formData.content) {
      alert('Please provide a monograph title or content before requesting recommendations.');
      return;
    }

    setRecommending(true);
    setRecommendNotice(null);
    try {
      const recs = await apiAdminRecommendMedia({
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        categorySlug: formData.categorySlug
      });
      setRecommendations(recs || []);
      if (recs && recs.length > 0) {
        setRecommendNotice(`Discovered ${recs.length} relevant photographic candidates for "${formData.title}".`);
      } else {
        setRecommendNotice('No direct keyword matches found. Showing general discipline photography.');
      }
    } catch (err) {
      setRecommendNotice(`Recommendation failed: ${err.message}`);
    } finally {
      setRecommending(false);
    }
  };

  const handleApplyRecommendation = (rec) => {
    const asset = rec.asset;
    setFormData((prev) => ({
      ...prev,
      imageSrc: asset.src
    }));
    setActionNotice({ type: 'success', text: `Assigned photography: "${asset.title}" (${asset.photographer})` });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleRollbackToBaseline = async () => {
    if (isNew) {
      setFormData((prev) => ({ ...prev, imageSrc: '/images/hero.jpg' }));
      return;
    }

    if (!window.confirm('Reset this article\'s image to the permanent baseline asset (/images/hero.jpg)?')) {
      return;
    }

    try {
      await apiAdminRollbackMedia({ targetType: 'article', targetId: id });
      setFormData((prev) => ({ ...prev, imageSrc: '/images/hero.jpg' }));
      setActionNotice({ type: 'success', text: 'Monograph cover image rolled back to baseline (/images/hero.jpg).' });
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    }
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

  // Find currently selected asset details for live preview
  const currentAsset = availableMedia.find((m) => m.src === formData.imageSrc);

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

      {actionNotice && (
        <div className={`admin-alert-${actionNotice.type}`} role="alert">
          {actionNotice.text}
        </div>
      )}

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

        {/* Enhanced Media Curation & Recommendation Section */}
        <div className="form-media-curation-box">
          <div className="curation-box-header">
            <div>
              <label htmlFor="article-image" className="curation-box-title">
                Cover Photography & Media Curation
              </label>
              <p className="curation-box-desc">
                Select an editorial asset or run AI keyword matching against the curated library.
              </p>
            </div>

            <div className="curation-header-actions">
              <button
                type="button"
                className="btn-admin-recommend"
                onClick={handleRecommendMedia}
                disabled={recommending}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>{recommending ? 'Analyzing Monograph...' : 'Suggest Media'}</span>
              </button>

              <button
                type="button"
                className="btn-admin-rollback"
                onClick={handleRollbackToBaseline}
                title="Reset to permanent baseline /images/hero.jpg"
              >
                Rollback to Baseline
              </button>
            </div>
          </div>

          {recommendNotice && (
            <div className="curation-notice">
              {recommendNotice}
            </div>
          )}

          {/* Recommendations Shelf */}
          {recommendations.length > 0 && (
            <div className="recommendations-shelf">
              <h4 className="shelf-title">Curated Matches:</h4>
              <div className="shelf-grid">
                {recommendations.map((rec, idx) => (
                  <div
                    key={rec.asset.id || idx}
                    className={`shelf-item ${formData.imageSrc === rec.asset.src ? 'active-selection' : ''}`}
                    onClick={() => handleApplyRecommendation(rec)}
                  >
                    <div className="shelf-thumb">
                      <img src={rec.asset.src} alt={rec.asset.title} />
                      <span className="shelf-score">Score: {rec.score}</span>
                    </div>
                    <div className="shelf-details">
                      <h5>{rec.asset.title}</h5>
                      <p className="shelf-photog">By {rec.asset.photographer}</p>
                      <p className="shelf-reason">{rec.matchReason}</p>
                      <button
                        type="button"
                        className="btn-apply-rec"
                        onClick={(e) => { e.stopPropagation(); handleApplyRecommendation(rec); }}
                      >
                        {formData.imageSrc === rec.asset.src ? '✓ Selected' : 'Apply Photography'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Select Dropdown and Live Preview */}
          <div className="form-media-selector-row">
            <div className="form-group flex-1">
              <label htmlFor="article-image">Active Image Path</label>
              <select
                id="article-image"
                name="imageSrc"
                value={formData.imageSrc}
                onChange={handleChange}
              >
                <optgroup label="Permanent Baseline Invariants">
                  <option value="/images/hero.jpg">/images/hero.jpg — Urban Strorkes (Sebastian Weiss)</option>
                  <option value="/images/gallery-1.jpg">/images/gallery-1.jpg — Concrete Spiral Staircase</option>
                  <option value="/images/gallery-2.jpg">/images/gallery-2.jpg — Suspension Bridge at Dawn</option>
                  <option value="/images/gallery-3.jpg">/images/gallery-3.jpg — Angular Modern Pavilion</option>
                  <option value="/images/gallery-4.jpg">/images/gallery-4.jpg — Curved Skyscraper Reflections</option>
                </optgroup>

                {availableMedia.filter((m) => !m.isOriginal).length > 0 && (
                  <optgroup label="Curated Library Photography">
                    {availableMedia
                      .filter((m) => !m.isOriginal)
                      .map((m) => (
                        <option key={m.id} value={m.src}>
                          {m.src} — {m.title} ({m.photographer})
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Live Media Card Preview */}
            <div className="media-live-preview-box">
              <div className="preview-thumb">
                <img src={formData.imageSrc} alt="Selected cover preview" />
              </div>
              <div className="preview-meta">
                <span className="preview-filename">{formData.imageSrc.split('/').pop()}</span>
                {currentAsset ? (
                  <>
                    <span className="preview-author">Photo: {currentAsset.photographer}</span>
                    <span className="preview-license">{currentAsset.licenseType}</span>
                  </>
                ) : (
                  <span className="preview-author">Baseline Monograph</span>
                )}
              </div>
            </div>
          </div>
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
