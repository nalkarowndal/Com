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
  const [sortBy, setSortBy] = useState('latest');
  const [activeMedium, setActiveMedium] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const catData = await fetchCategoryDetail('art');
        const articlesRes = await fetchArticles({
          category: 'art',
          page: pagination.page,
          limit: 6,
          sort: sortBy
        });

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
        console.error('Failed to load art articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [pagination.page, sortBy]);

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];
  const filteredStories = activeMedium === 'all'
    ? articles
    : articles.filter((a) => a.tags?.toLowerCase().includes(activeMedium.toLowerCase()));

  return (
    <div className="category-page art-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Art' }]} />

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
                  src={featuredStory.imageSrc || '/images/gallery-3.jpg'}
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
              onClick={() => setActiveMedium('all')}
            >
              All Movements
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'sculpture' ? 'active' : ''}`}
              onClick={() => setActiveMedium('sculpture')}
            >
              Sculpture & Void
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'light' ? 'active' : ''}`}
              onClick={() => setActiveMedium('light')}
            >
              Light Installations
            </button>
            <button
              type="button"
              className={`tag-btn ${activeMedium === 'minimalism' ? 'active' : ''}`}
              onClick={() => setActiveMedium('minimalism')}
            >
              Monochrome
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="art-sort" className="sort-label">Order:</label>
            <select
              id="art-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Critiques</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Gallery Exhibition Grid */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="art-grid-wrapper">
            <div className="art-editorial-grid">
              {filteredStories.map((article) => (
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
                onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
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
