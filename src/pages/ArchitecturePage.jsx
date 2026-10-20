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
  const [sortBy, setSortBy] = useState('latest');
  const [activeTag, setActiveTag] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const catData = await fetchCategoryDetail('architecture');
        const articlesRes = await fetchArticles({
          category: 'architecture',
          page: pagination.page,
          limit: 6,
          sort: sortBy
        });

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
        console.error('Failed to load architecture articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [pagination.page, sortBy]);

  const featuredStory = articles.find((a) => a.isFeatured) || articles[0];
  const gridStories = activeTag === 'all'
    ? articles
    : articles.filter((a) => a.tags?.toLowerCase().includes(activeTag.toLowerCase()));

  return (
    <div className="category-page architecture-page">
      <div className="category-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Architecture' }]} />

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
              onClick={() => setActiveTag('all')}
            >
              All Works
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'minimalist' ? 'active' : ''}`}
              onClick={() => setActiveTag('minimalist')}
            >
              Minimalist
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'concrete' ? 'active' : ''}`}
              onClick={() => setActiveTag('concrete')}
            >
              Concrete & Brutalism
            </button>
            <button
              type="button"
              className={`tag-btn ${activeTag === 'facade' ? 'active' : ''}`}
              onClick={() => setActiveTag('facade')}
            >
              High-Rise Facades
            </button>
          </div>

          <div className="sort-controls">
            <label htmlFor="arch-sort" className="sort-label">Sort by:</label>
            <select
              id="arch-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="latest">Latest Releases</option>
              <option value="views">Most Read</option>
            </select>
          </div>
        </div>

        {/* Architecture Grid with asymmetric negative-space styling */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="architecture-grid-wrapper">
            <div className="architecture-editorial-grid">
              {gridStories.map((article, index) => (
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
                onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
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
