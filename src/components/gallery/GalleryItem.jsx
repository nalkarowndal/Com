export default function GalleryItem({
  src,
  alt,
  title,
  index,
  onClick
}) {
  return (
    <div className="col col-md-one-half col-lg-one-fourth">
      <div
        className="gallery-card"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        aria-label={`View ${title || alt || `gallery image ${index + 1}`} in high resolution`}
      >
        <img
          src={src}
          alt={alt || `Gallery photograph ${index + 1}`}
          loading="lazy"
          width="400"
          height="400"
        />
        <div className="gallery-overlay" aria-hidden="true">
          <div className="zoom-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
