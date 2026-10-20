import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import EditorialCard from '../components/editorial/EditorialCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchArticles, fetchCategoryDetail } from '../services/api';

export default function ArchitecturePage() {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [activeTag, setActiveTag] = useState('all');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [catData, articlesRes] = await Promise.all([
          fetchCategoryDetail('architecture', { signal: controller.signal }),
          fetchArticles({
            category: 'architecture',
            tag: activeTag !== 'all' ? activeTag : undefined,
            page,
            limit: 6,
            sort: sortBy,
            signal: controller.signal
          })
        ]);

        if (isMounted) {
          setCategory(catData?.category || {
            name: 'Architecture',
            description: 'Monographs, structural forms, and spatial discourse defining modern metropolises and organic architecture.',
            heroImage: '/images/hero.jpg'
          });
          setArticles(articlesRes.items || []);
          setPagination(articlesRes.pagination);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load architecture articles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load monographs. Please verify your connection.');
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
  }, [page, sortBy, activeTag, retryTrigger]);

  const handleTagChange = (tag) => {
    setActiveTag(tag);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  return (
    <div className="category-page architecture-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Architecture' }]} />

        <PageHeader
          badge="Discourse & Form"
          title="Architecture"
          description={category?.description}
        />

        {/* Dedicated Architecture Hero Banner */}
        <section className="architecture-hero-banner" aria-label="Featured Architectural Monograph">
          <div className="arch-hero-image-wrap">
            <img
              src="/images/hero.jpg"
              alt="Urban Strorkes by Sebastian Weiss"
              className="arch-hero-bg"
            />
            <div className="arch-hero-overlay">
              <span className="hero-subbadge">Monograph Spotlight</span>
              <h2 className="arch-hero-title">Urban Strorkes</h2>
              <p className="arch-hero-author">Photographed by Sebastian Weiss</p>
              <p className="arch-hero-text">
                An acclaimed photographic exploration of contemporary metropolitan form, monolithic concrete curves, and reflective structural glass.
              </p>
              <Link to="/stories/urban-strorkes" className="arch-hero-cta">
                <span>Explore Full Monograph</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Filter & Controls */}
        <div className="category-controls-bar">
          <div className="filter-tags" role="toolbar" aria-label="Tag filters">
            <button
              type="button"
              className={`tag-btn ${activeTag === 'all' ? 'active' : ''}`}
              onClick={() => handleTagChange('all')}
            >
              All Works
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'minimalist' ? 'active' : ''}`}
              onClick={() => handleTagChange('minimalist')}
            >
              Minimalist
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'concrete' ? 'active' : ''}`}
              onClick={() => handleTagChange('concrete')}
            >
              Concrete & Brutalism
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'facade' ? 'active' : ''}`}
              onClick={() => handleTagChange('facade')}
            >
              High-Rise Facades
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="arch-sort" className="sort-label">Sort by:</label>
            <select
              id="arch-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Releases</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && !error && (
          <div className="results-count-bar" aria-live="polite">
            <span>Showing {articles.length} of {pagination.total} monographs</span>
          </div>
        )}

        {/* Architecture Grid with loading, error and empty states */}
        {error ? (
          <div className="editorial-status-box error-box" role="alert">
            <h3 className="status-title">Unable to Load Architecture Archive</h3>
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
            <h3 className="status-title">No Monographs Found</h3>
            <p className="status-desc">
              No architectural records match tag &ldquo;{activeTag}&rdquo;. Try resetting your filters.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setActiveTag('all');
                setSortBy('latest');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="architecture-grid-wrapper">
            <div className="architecture-editorial-grid">
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className={`arch-grid-col ${index === 0 ? 'arch-col-wide' : 'arch-col-standard'}`}
                >
                  <EditorialCard
                    article={article}
                    variant="architecture"
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

        {/* Architectural Philosophy Section */}
        <section className="architecture-philosophy-strip" aria-label="Editorial manifesto">
          <div className="philosophy-content">
            <blockquote>
              "Architecture is not simply the art of enclosing volume; it is the choreographic alignment of light, weight, and human memory."
            </blockquote>
            <cite>— PRISM Editorial Archive</cite>
          </div>
        </section>
      </div>
    </div>
  );
}
