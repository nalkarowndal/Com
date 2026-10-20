export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination-nav" aria-label="Pagination Navigation">
      <ul className="pagination-list">
        <li>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous Page"
          >
            &#10094; Prev
          </button>
        </li>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = pageNum === currentPage;
          return (
            <li key={pageNum}>
              <button
                type="button"
                className={`pagination-number ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next Page"
          >
            Next &#10095;
          </button>
        </li>
      </ul>
    </nav>
  );
}
