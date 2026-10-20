import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-inner">
        <span className="error-code">404</span>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-desc">
          The architectural monograph or editorial article you are seeking does not exist or has been relocated within the archive.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-return-home">
            Return to Homepage
          </Link>
          <Link to="/search" className="btn-search-archive">
            Search Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
