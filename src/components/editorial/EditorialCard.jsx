import { Link } from 'react-router-dom';

export default function EditorialCard({
  article,
  variant = 'standard', // 'standard' | 'architecture' | 'travel' | 'art' | 'food'
  showExcerpt = true
}) {
  if (!article) return null;

  const {
    slug,
    title,
    author,
    badge,
    imageSrc,
    excerpt,
    categorySlug,
    tags,
    isDemo
  } = article;

  const categoryFallbacks = {
    architecture: '/images/hero.jpg',
    travel: '/images/library/travel-kyoto-pavilions.jpg',
    art: '/images/library/art-spatial-dimensions.jpg',
    food: '/images/library/food-slow-harvest.jpg'
  };

  const resolvedImage = imageSrc || categoryFallbacks[categorySlug] || '/images/hero.jpg';

  return (
    <article className={`editorial-card editorial-card--${variant}`}>
      <Link to={`/stories/${slug}`} className="editorial-card-media-link" tabIndex={-1} aria-hidden="true">
        <div className="editorial-card-image-wrap">
          <img
            src={resolvedImage}
            alt={title}
            loading="lazy"
            className="editorial-card-img"
          />
          {badge && <span className="editorial-card-badge">{badge}</span>}
          {isDemo && <span className="editorial-card-demo-tag">DEMO</span>}
        </div>
      </Link>

      <div className="editorial-card-body">
        <div className="editorial-card-meta">
          {categorySlug && (
            <Link to={`/${categorySlug}`} className="editorial-card-category">
              {categorySlug.toUpperCase()}
            </Link>
          )}
          {author && <span className="editorial-card-author">by {author}</span>}
        </div>

        <h3 className="editorial-card-title">
          <Link to={`/stories/${slug}`}>{title}</Link>
        </h3>

        {showExcerpt && excerpt && (
          <p className="editorial-card-excerpt">{excerpt}</p>
        )}

        {tags && (
          <div className="editorial-card-tags">
            {tags.split(',').slice(0, 3).map((tag, idx) => (
              <span key={idx} className="editorial-tag-item">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="editorial-card-footer">
          <Link to={`/stories/${slug}`} className="editorial-card-link">
            <span>Read Story</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
