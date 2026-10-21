import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import EditorialCard from '../components/editorial/EditorialCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchArticles, fetchCategoryDetail } from '../services/api';

export default function FoodPage() {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [activeTheme, setActiveTheme] = useState('all');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [catData, articlesRes] = await Promise.all([
          fetchCategoryDetail('food', { signal: controller.signal }),
          fetchArticles({
            category: 'food',
            tag: activeTheme !== 'all' ? activeTheme : undefined,
            page,
            limit: 6,
            sort: sortBy,
            signal: controller.signal
          })
        ]);

        if (isMounted) {
          setCategory(catData?.category || {
            name: 'Food',
            description: 'Culinary heritage, artisanal gastronomy, and the thoughtful intersection of taste, culture, and aesthetics.',
            heroImage: '/images/gallery-3.jpg'
          });
          setArticles(articlesRes.items || []);
          setPagination(articlesRes.pagination);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load food articles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load culinary essays. Please verify your connection.');
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
  }, [page, sortBy, activeTheme, retryTrigger]);

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];

  return (
    <div className="category-page food-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Food' }]} />

        <PageHeader
          badge="Taste & Heritage"
          title="Food"
          description={category?.description}
        />

        {/* Sensory Culinary Spotlight */}
        {featuredStory && (
          <section className="food-spotlight-hero" aria-label="Featured Culinary Monograph">
            <div className="food-spotlight-card">
              <div className="food-spotlight-image-side">
                <img
                  src={featuredStory.imageSrc || category?.heroImage || '/images/library/hero-food-gastronomy.jpg'}
                  alt={featuredStory.title}
                  className="food-spotlight-img"
                />
                <span className="food-provenance-tag">Artisanal Craft</span>
              </div>

              <div className="food-spotlight-text-side">
                <span className="food-card-badge">{featuredStory.badge || 'Gastronomy Chronicle'}</span>
                <h2 className="food-spotlight-title">{featuredStory.title}</h2>
                <p className="food-spotlight-author">Written by {featuredStory.author}</p>
                <p className="food-spotlight-excerpt">{featuredStory.excerpt}</p>
                <Link to={`/stories/${featuredStory.slug}`} className="food-spotlight-cta">
                  <span>Explore Gastronomic Essay</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Gastronomy Themes & Sort Toolbar */}
        <div className="category-controls-bar food-controls-bar">
          <div className="filter-tags" role="toolbar" aria-label="Food themes filters">
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'all' ? 'active' : ''}`}
              onClick={() => handleThemeChange('all')}
            >
              All Traditions
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'bakery' ? 'active' : ''}`}
              onClick={() => handleThemeChange('bakery')}
            >
              Grains & Fermentation
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'umami' ? 'active' : ''}`}
              onClick={() => handleThemeChange('umami')}
            >
              Broths & Umami
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'artisanal' ? 'active' : ''}`}
              onClick={() => handleThemeChange('artisanal')}
            >
              Heritage Craft
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="food-sort" className="sort-label">Order by:</label>
            <select
              id="food-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Table Stories</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && !error && (
          <div className="results-count-bar" aria-live="polite">
            <span>Showing {articles.length} of {pagination.total} culinary essays</span>
          </div>
        )}

        {/* Food Stories Grid with error and empty states */}
        {error ? (
          <div className="editorial-status-box error-box" role="alert">
            <h3 className="status-title">Unable to Load Culinary Archive</h3>
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
            <h3 className="status-title">No Culinary Essays Found</h3>
            <p className="status-desc">
              No articles match theme &ldquo;{activeTheme}&rdquo;. Try resetting your filters.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setActiveTheme('all');
                setSortBy('latest');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="food-grid-wrapper">
            <div className="food-editorial-grid">
              {articles.map((article) => (
                <div key={article.id} className="food-grid-item">
                  <EditorialCard
                    article={article}
                    variant="food"
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

        {/* Culinary Philosophy Strip */}
        <section className="food-philosophy-strip" aria-label="Gastronomic manifesto">
          <div className="food-philosophy-content">
            <span className="mini-stamp">PRISM CUISINE</span>
            <p>
              "True culinary depth begins not in complex ornamentation, but in the patience to let single ingredients speak their geographic truth."
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
