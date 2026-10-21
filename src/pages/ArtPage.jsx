import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import EditorialCard from '../components/editorial/EditorialCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchArticles, fetchCategoryDetail } from '../services/api';

export default function ArtPage() {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [activeMedium, setActiveMedium] = useState('all');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [catData, articlesRes] = await Promise.all([
          fetchCategoryDetail('art', { signal: controller.signal }),
          fetchArticles({
            category: 'art',
            tag: activeMedium !== 'all' ? activeMedium : undefined,
            page,
            limit: 6,
            sort: sortBy,
            signal: controller.signal
          })
        ]);

        if (isMounted) {
          setCategory(catData?.category || {
            name: 'Art',
            description: 'Contemporary spatial installations, sculptural minimalism, and visual critiques in modern galleries.',
            heroImage: '/images/gallery-1.jpg'
          });
          setArticles(articlesRes.items || []);
          setPagination(articlesRes.pagination);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load art articles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load art critiques. Please verify your connection.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, sortBy, activeMedium, retryTrigger]);

  const handleMediumChange = (medium) => {
    setActiveMedium(medium);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];

  return (
    <div className="category-page art-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Art' }]} />

        <PageHeader
          badge="Exhibition & Critique"
          title="Art"
          description={category?.description}
        />

        {/* Art White-Cube Spotlight Hero */}
        {featuredStory && (
          <section className="art-spotlight-hero" aria-label="Curator's Exhibition Feature">
            <div className="art-spotlight-frame">
              <div className="art-spotlight-visual">
                <img
                  src={featuredStory.imageSrc || category?.heroImage || '/images/library/hero-art-exhibition.jpg'}
                  alt={featuredStory.title}
                  className="art-spotlight-img"
                />
                <div className="art-gallery-plaque">
                  <span className="plaque-num">NO. 03</span>
                  <span className="plaque-curator">Curatorial Spotlight</span>
                </div>
              </div>

              <div className="art-spotlight-info">
                <span className="art-spotlight-badge">{featuredStory.badge || 'Current Exhibition'}</span>
                <h2 className="art-spotlight-title">{featuredStory.title}</h2>
                <p className="art-spotlight-author">Critique by {featuredStory.author}</p>
                <div className="art-spotlight-divider" />
                <p className="art-spotlight-excerpt">{featuredStory.excerpt}</p>
                <Link to={`/stories/${featuredStory.slug}`} className="art-spotlight-cta">
                  <span>Enter Exhibition Essay</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Art Medium & Sort Toolbar */}
        <div className="category-controls-bar art-controls-bar">
          <div className="filter-tags" role="toolbar" aria-label="Art medium filters">
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'all' ? 'active' : ''}`}
              onClick={() => handleMediumChange('all')}
            >
              All Movements
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'sculpture' ? 'active' : ''}`}
              onClick={() => handleMediumChange('sculpture')}
            >
              Sculpture & Void
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'light' ? 'active' : ''}`}
              onClick={() => handleMediumChange('light')}
            >
              Light Installations
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'minimalism' ? 'active' : ''}`}
              onClick={() => handleMediumChange('minimalism')}
            >
              Monochrome
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="art-sort" className="sort-label">Order:</label>
            <select
              id="art-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Critiques</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && !error && (
          <div className="results-count-bar" aria-live="polite">
            <span>Showing {articles.length} of {pagination.total} exhibitions</span>
          </div>
        )}

        {/* Gallery Exhibition Grid with error and empty states */}
        {error ? (
          <div className="editorial-status-box error-box" role="alert">
            <h3 className="status-title">Unable to Load Art Archive</h3>
            <p className="status-desc">{error}</p>
            <button
              type="button"
              className="btn-retry"
              onClick={() => setRetryTrigger((k) => k + 1)}
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : articles.length === 0 ? (
          <div className="editorial-status-box empty-box">
            <h3 className="status-title">No Exhibitions Found</h3>
            <p className="status-desc">
              No gallery works match movement &ldquo;{activeMedium}&rdquo;. Try resetting your filters.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setActiveMedium('all');
                setSortBy('latest');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="art-grid-wrapper">
            <div className="art-editorial-grid">
              {articles.map((article) => (
                <div key={article.id} className="art-grid-item">
                  <EditorialCard
                    article={article}
                    variant="art"
                    showExcerpt={true}
                  />
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        )}

        {/* Curatorial Note */}
        <section className="art-curatorial-statement" aria-label="Curatorial statement">
          <div className="curatorial-inner">
            <span className="statement-label">Curatorial Note</span>
            <p>
              "The gallery is not a passive receptacle for aesthetic objects, but an active architectural chamber where presence, duration, and emptiness become tangible phenomena."
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
