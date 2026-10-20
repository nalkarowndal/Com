import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EditorialCard from '../components/editorial/EditorialCard';
import { fetchArticleDetail } from '../services/api';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadArticle() {
      try {
        const data = await fetchArticleDetail(slug, { signal: controller.signal });
        if (isMounted) {
          if (!data) {
            setError('Article not found');
          } else {
            setArticle(data);
            setError(null);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (isMounted) {
          setError(err.message || 'Article not found');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadArticle();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="article-container loading-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-detail-page not-found-state">
        <div className="article-container">
          <span className="error-code">404</span>
          <h1 className="error-title">Monograph Not Found</h1>
          <p className="error-desc">
            The article slug <code>{slug}</code> could not be located in our editorial database.
          </p>
          <div className="error-actions">
            <Link to="/" className="btn-primary">Return to Home</Link>
            <Link to="/search" className="btn-secondary">Search Archive</Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = article.categorySlug
    ? article.categorySlug.charAt(0).toUpperCase() + article.categorySlug.slice(1)
    : 'Editorial';

  // Split content by double newlines into clean editorial paragraphs
  const paragraphs = article.content
    ? article.content.split('\n\n').filter((p) => p.trim().length > 0)
    : [];

  return (
    <article className="article-detail-page">
      <div className="article-container">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: categoryName, href: `/${article.categorySlug}` },
            { label: article.title }
          ]}
        />

        {/* Article Header */}
        <header className="article-header">
          <div className="article-header-meta">
            <Link to={`/${article.categorySlug}`} className="article-category-badge">
              {categoryName}
            </Link>
            {article.badge && (
              <span className="article-badge-label">{article.badge}</span>
            )}
            {article.isDemo && (
              <span className="article-demo-badge">DEMO ARCHIVE</span>
            )}
          </div>

          <h1 className="article-main-title">{article.title}</h1>

          <div className="article-author-strip">
            <div className="author-info">
              {article.author && (
                <span className="author-name">Written by <strong>{article.author}</strong></span>
              )}
              {article.views && (
                <span className="article-views">· {article.views.toLocaleString()} reads</span>
              )}
            </div>

            <div className="article-actions">
              <button
                type="button"
                className="btn-share"
                onClick={handleShare}
                aria-label="Share article link"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="article-featured-media">
          <img
            src={article.imageSrc || '/images/hero.jpg'}
            alt={article.title}
            className="article-cover-img"
          />
          <figcaption className="media-caption">
            {article.title} — Photography & Visual Documentation
          </figcaption>
        </div>

        {/* Excerpt / Lead Paragraph */}
        {article.excerpt && (
          <div className="article-lead-box">
            <p className="article-lead-text">{article.excerpt}</p>
          </div>
        )}

        {/* Article Body */}
        <div className="article-body-content">
          {paragraphs.map((p, idx) => (
            <p key={idx} className={idx === 0 ? 'drop-cap-paragraph' : ''}>
              {p}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && (
          <div className="article-tags-block">
            <span className="tags-label">Keywords:</span>
            <div className="tags-list">
              {article.tags.split(',').map((tag, idx) => (
                <Link
                  key={idx}
                  to={`/search?q=${encodeURIComponent(tag.trim())}`}
                  className="article-tag-link"
                >
                  #{tag.trim()}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Between Stories */}
        <div className="article-nav-strip">
          <button
            type="button"
            className="btn-return-category"
            onClick={() => navigate(`/${article.categorySlug || ''}`)}
          >
            &larr; Back to {categoryName}
          </button>
        </div>

        {/* Related Stories */}
        {article.related && article.related.length > 0 && (
          <section className="article-related-section" aria-label="Related stories">
            <h2 className="related-title">Related Monograph Studies</h2>
            <div className="related-cards-grid">
              {article.related.map((rel) => (
                <EditorialCard
                  key={rel.id}
                  article={rel}
                  variant={rel.categorySlug || 'standard'}
                  showExcerpt={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
