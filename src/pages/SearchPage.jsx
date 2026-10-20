import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import EditorialCard from '../components/editorial/EditorialCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { searchArticles } from '../services/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('category') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [inputVal, setInputVal] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Sync state with URL params when URL changes
  useEffect(() => {
    setInputVal(qParam);
    setSelectedCategory(catParam);

    let isMounted = true;
    async function executeSearch() {
      setLoading(true);
      try {
        const res = await searchArticles({
          q: qParam,
          category: catParam,
          page: pageParam,
          limit: 9
        });
        if (isMounted) {
          setResults(res.results || []);
          setPagination(res.pagination || { total: 0, page: 1, totalPages: 1 });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    executeSearch();
    return () => { isMounted = false; };
  }, [qParam, catParam, pageParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (inputVal.trim()) newParams.set('q', inputVal.trim());
    if (selectedCategory && selectedCategory !== 'all') newParams.set('category', selectedCategory);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-archive-page">
      <div className="search-container">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Search Archive' }]} />

        <PageHeader
          badge="Query & Retrieval"
          title="Search Collection"
          description="Index and discover architectural monographs, travel chronicles, artistic critique, and gastronomic essays."
        />

        {/* Search Input Bar */}
        <form className="search-query-form" onSubmit={handleSubmit} role="search">
          <div className="search-form-row">
            <div className="search-input-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="search-field"
                placeholder="Search monographs, architects, materials, locations..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                aria-label="Search monographs"
              />
            </div>

            <div className="search-category-wrap">
              <select
                className="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All Disciplines</option>
                <option value="architecture">Architecture</option>
                <option value="travel">Travel</option>
                <option value="art">Art</option>
                <option value="food">Food</option>
              </select>
            </div>

            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </div>
        </form>

        {/* Results Metadata */}
        <div className="search-status-bar">
          <div className="search-count">
            {loading ? (
              <span>Querying editorial database...</span>
            ) : (
              <span>
                Found <strong>{pagination.total}</strong> {pagination.total === 1 ? 'article' : 'articles'}
                {qParam ? ` for "${qParam}"` : ''}
                {catParam !== 'all' ? ` in ${catParam.toUpperCase()}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : results.length > 0 ? (
          <div className="search-results-grid">
            {results.map((article) => (
              <div key={article.id} className="search-result-item">
                <EditorialCard
                  article={article}
                  variant={article.categorySlug || 'standard'}
                  showExcerpt={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="empty-box">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <h3>No monographs matched your query</h3>
              <p>
                Try refining your search terms, removing specific category filters, or exploring popular keywords like "Urban Strorkes", "Concrete", "Kyoto", or "Sourdough".
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
