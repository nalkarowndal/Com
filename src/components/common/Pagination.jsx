export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis if many pages
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('ellipsis-start');

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('ellipsis-end');

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="pagination-nav" aria-label="Pagination Navigation">
      <ul className="pagination-list">
        <li>
          <button
            type="button"
            className="pagination-btn pagination-prev"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Go to previous page"
          >
            &#10094; Prev
          </button>
        </li>

        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <li key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                <span>&hellip;</span>
              </li>
            );
          }

          const isActive = p === currentPage;
          return (
            <li key={p}>
              <button
                type="button"
                className={`pagination-btn pagination-number ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            </li>
          );
        })}

        <li>
          <button
            type="button"
            className="pagination-btn pagination-next"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Go to next page"
          >
            Next &#10095;
          </button>
        </li>
      </ul>
    </nav>
  );
}
