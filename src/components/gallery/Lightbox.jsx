import { useEffect, useRef } from 'react';

export default function Lightbox({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onPrev,
  onNext
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onNext();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog lightbox-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery viewer"
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close image viewer (Escape)"
        >
          ✕
        </button>

        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav-btn prev"
            onClick={onPrev}
            aria-label="Previous image (Left Arrow)"
          >
            &#10094;
          </button>
        )}

        <div className="lightbox-image-container">
          <img
            src={currentImage.src}
            alt={currentImage.alt || `Gallery Image ${currentIndex + 1}`}
            width="1200"
            height="800"
          />
        </div>

        {images.length > 1 && (
          <button
            type="button"
            className="lightbox-nav-btn next"
            onClick={onNext}
            aria-label="Next image (Right Arrow)"
          >
            &#10095;
          </button>
        )}

        <div className="lightbox-caption">
          <span>{currentImage.title || currentImage.alt}</span>
          <span style={{ marginLeft: '12px', opacity: 0.7 }}>
            ({currentIndex + 1} / {images.length})
          </span>
        </div>
      </div>
    </div>
  );
}
