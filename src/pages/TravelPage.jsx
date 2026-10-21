import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import EditorialCard from '../components/editorial/EditorialCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchArticles, fetchCategoryDetail } from '../services/api';

export default function TravelPage() {
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [activeRegion, setActiveRegion] = useState('all');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [catData, articlesRes] = await Promise.all([
          fetchCategoryDetail('travel', { signal: controller.signal }),
          fetchArticles({
            category: 'travel',
            tag: activeRegion !== 'all' ? activeRegion : undefined,
            page,
            limit: 6,
            sort: sortBy,
            signal: controller.signal
          })
        ]);

        if (isMounted) {
          setCategory(catData?.category || {
            name: 'Travel',
            description: 'Contemplative journeys, cultural terrains, and geographic narratives across continents and historic cities.',
            heroImage: '/images/gallery-2.jpg'
          });
          setArticles(articlesRes.items || []);
          setPagination(articlesRes.pagination);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load travel articles:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load travel chronicles. Please verify your connection.');
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
  }, [page, sortBy, activeRegion, retryTrigger]);

  const handleRegionChange = (region) => {
    setActiveRegion(region);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];

  return (
    <div className="category-page travel-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Travel' }]} />

        <PageHeader
          badge="Terrains & Horizons"
          title="Travel"
          description={category?.description}
        />

        {/* Travel Panoramic Hero */}
        {featuredStory && (
          <section className="travel-hero-panorama" aria-label="Featured Travel Expedition">
            <div className="travel-panorama-inner">
              <img
                src={featuredStory.imageSrc || category?.heroImage || '/images/library/travel-kyoto-pavilions.jpg'}
                alt={featuredStory.title}
                className="travel-panorama-img"
              />
              <div className="travel-panorama-caption">
                <span className="travel-pill-badge">{featuredStory.badge || 'Featured Journey'}</span>
                <h2 className="travel-panorama-title">{featuredStory.title}</h2>
                <p className="travel-panorama-author">Field Notes by {featuredStory.author}</p>
                <p className="travel-panorama-excerpt">{featuredStory.excerpt}</p>
                <Link to={`/stories/${featuredStory.slug}`} className="travel-panorama-btn">
                  <span>Read Field Chronicle</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Region & Sort Toolbar */}
        <div className="category-controls-bar">
          <div className="filter-tags" role="toolbar" aria-label="Region filters">
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'all' ? 'active' : ''}`}
              onClick={() => handleRegionChange('all')}
            >
              All Regions
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'japan' ? 'active' : ''}`}
              onClick={() => handleRegionChange('japan')}
            >
              East Asia & Kyoto
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'mediterranean' ? 'active' : ''}`}
              onClick={() => handleRegionChange('mediterranean')}
            >
              Aegean Archipelago
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'bridges' ? 'active' : ''}`}
              onClick={() => handleRegionChange('bridges')}
            >
              Iconic Crossings
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="travel-sort" className="sort-label">Sort by:</label>
            <select
              id="travel-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Departures</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        {!loading && !error && (
          <div className="results-count-bar" aria-live="polite">
            <span>Showing {articles.length} of {pagination.total} chronicles</span>
          </div>
        )}

        {/* Travel Stories Grid with error and empty states */}
        {error ? (
          <div className="editorial-status-box error-box" role="alert">
            <h3 className="status-title">Unable to Load Travel Archive</h3>
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
            <h3 className="status-title">No Chronicles Found</h3>
            <p className="status-desc">
              No expeditions match region tag &ldquo;{activeRegion}&rdquo;. Try resetting your filters.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setActiveRegion('all');
                setSortBy('latest');
                setPage(1);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="travel-grid-wrapper">
            <div className="travel-editorial-cards">
              {articles.map((article) => (
                <div key={article.id} className="travel-card-wrapper">
                  <EditorialCard
                    article={article}
                    variant="travel"
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

        {/* Visual Travel Strip */}
        <section className="travel-photo-strip" aria-label="Travel Photographic Vignettes">
          <div className="strip-header">
            <h3>Visual Journal: Morning Terrains</h3>
            <Link to="/gallery" className="strip-link">View Full Gallery &rarr;</Link>
          </div>
          <div className="strip-grid">
            <div className="strip-item">
              <img src="/images/gallery-2.jpg" alt="Suspension Bridge at dawn" />
              <span>Steel in Amber Mist</span>
            </div>
            <div className="strip-item">
              <img src="/images/library/travel-kyoto-pavilions.jpg" alt="Pavilion timber reflections" />
              <span>Cypress Sanctuary</span>
            </div>
            <div className="strip-item">
              <img src="/images/library/travel-aegean-dwellings.jpg" alt="Aegean lime terraces" />
              <span>Limestone & Sea</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
