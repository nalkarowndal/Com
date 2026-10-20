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
  const [sortBy, setSortBy] = useState('latest');
  const [activeRegion, setActiveRegion] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const catData = await fetchCategoryDetail('travel');
        const articlesRes = await fetchArticles({
          category: 'travel',
          page: pagination.page,
          limit: 6,
          sort: sortBy
        });

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
        console.error('Failed to load travel articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [pagination.page, sortBy]);

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];
  const filteredStories = activeRegion === 'all'
    ? articles
    : articles.filter((a) => a.tags?.toLowerCase().includes(activeRegion.toLowerCase()));

  return (
    <div className="category-page travel-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Travel' }]} />

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
                src={featuredStory.imageSrc || '/images/gallery-2.jpg'}
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
              onClick={() => setActiveRegion('all')}
            >
              All Regions
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'japan' ? 'active' : ''}`}
              onClick={() => setActiveRegion('japan')}
            >
              East Asia & Kyoto
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'mediterranean' ? 'active' : ''}`}
              onClick={() => setActiveRegion('mediterranean')}
            >
              Aegean Archipelago
            </button>
            <button
              type="button"
              className={`tag-btn ${activeRegion === 'bridges' ? 'active' : ''}`}
              onClick={() => setActiveRegion('bridges')}
            >
              Iconic Crossings
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="travel-sort" className="sort-label">Sort by:</label>
            <select
              id="travel-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Departures</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Travel Stories Grid */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="travel-grid-wrapper">
            <div className="travel-editorial-cards">
              {filteredStories.map((article) => (
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
                onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
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
              <img src="/images/gallery-3.jpg" alt="Pavilion timber reflections" />
              <span>Cypress Sanctuary</span>
            </div>
            <div className="strip-item">
              <img src="/images/gallery-1.jpg" alt="Aegean lime terraces" />
              <span>Limestone & Sea</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
