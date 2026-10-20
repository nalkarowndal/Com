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
  const [sortBy, setSortBy] = useState('latest');
  const [activeTheme, setActiveTheme] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const catData = await fetchCategoryDetail('food');
        const articlesRes = await fetchArticles({
          category: 'food',
          page: pagination.page,
          limit: 6,
          sort: sortBy
        });

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
        console.error('Failed to load food articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [pagination.page, sortBy]);

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];
  const filteredStories = activeTheme === 'all'
    ? articles
    : articles.filter((a) => a.tags?.toLowerCase().includes(activeTheme.toLowerCase()));

  return (
    <div className="category-page food-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Food' }]} />

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
                  src={featuredStory.imageSrc || '/images/gallery-3.jpg'}
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
              onClick={() => setActiveTheme('all')}
            >
              All Traditions
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'bakery' ? 'active' : ''}`}
              onClick={() => setActiveTheme('bakery')}
            >
              Grains & Fermentation
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'umami' ? 'active' : ''}`}
              onClick={() => setActiveTheme('umami')}
            >
              Broths & Umami
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTheme === 'artisanal' ? 'active' : ''}`}
              onClick={() => setActiveTheme('artisanal')}
            >
              Heritage Craft
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="food-sort" className="sort-label">Order by:</label>
            <select
              id="food-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Table Stories</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Food Stories Grid */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="food-grid-wrapper">
            <div className="food-editorial-grid">
              {filteredStories.map((article) => (
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
                onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
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
