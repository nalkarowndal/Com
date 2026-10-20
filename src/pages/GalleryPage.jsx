import { useState, useEffect, useCallback } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchGallery } from '../services/api';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadGallery() {
      try {
        const data = await fetchGallery(activeCategory, { signal: controller.signal });
        if (isMounted) setItems(data || []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load gallery:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGallery();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeCategory]);

  // Manage body scroll lock cleanly via effect
  useEffect(() => {
    if (activeLightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [activeLightboxIndex]);

  const openLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  const nextImage = useCallback(() => {
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((prev) => (prev + 1) % items.length);
    }
  }, [activeLightboxIndex, items.length]);

  const prevImage = useCallback(() => {
    if (activeLightboxIndex !== null && items.length > 0) {
      setActiveLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  }, [activeLightboxIndex, items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, closeLightbox, nextImage, prevImage]);

  const currentItem = activeLightboxIndex !== null ? items[activeLightboxIndex] : null;

  return (
    <div className="gallery-archive-page">
      <div className="gallery-page-container">
        <Breadcrumb items={[{ label: 'Visual Archive' }]} />

        <PageHeader
          badge="Permanent Collection"
          title="Visual Archive"
          description="A curated photographic repository of structural forms, cultural landscapes, and sculptural dimensions across PRISM monographs."
        />

        {/* Category Filter Tabs */}
        <div className="gallery-filter-tabs" role="tablist" aria-label="Gallery category filters">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            className={`gallery-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Works
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'architecture'}
            className={`gallery-tab ${activeCategory === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveCategory('architecture')}
          >
            Architecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'travel'}
            className={`gallery-tab ${activeCategory === 'travel' ? 'active' : ''}`}
            onClick={() => setActiveCategory('travel')}
          >
            Travel
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'art'}
            className={`gallery-tab ${activeCategory === 'art' ? 'active' : ''}`}
            onClick={() => setActiveCategory('art')}
          >
            Art
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'food'}
            className={`gallery-tab ${activeCategory === 'food' ? 'active' : ''}`}
            onClick={() => setActiveCategory('food')}
          >
            Food
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="gallery-archive-grid">
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id || index}
                className="gallery-archive-item"
                onClick={() => openLightbox(index)}
                aria-label={`View ${item.title || item.alt || 'artwork'} in full screen`}
              >
                <div className="gallery-img-box">
                  <img
                    src={item.src}
                    alt={item.alt || item.title || 'Gallery image'}
                    loading="lazy"
                    className="gallery-thumb"
                  />
                  <div className="gallery-item-overlay">
                    <span className="gallery-item-category">
                      {item.categorySlug ? item.categorySlug.toUpperCase() : 'MONOGRAPH'}
                    </span>
                    <h3 className="gallery-item-title">{item.title || item.alt}</h3>
                    <span className="gallery-zoom-badge">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {currentItem && (
          <div
            className="modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Image Lightbox"
            onClick={closeLightbox}
          >
            <div
              className="modal-dialog lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeLightbox}
                aria-label="Close Lightbox"
              >
                &times;
              </button>

              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={prevImage}
                aria-label="Previous Image"
              >
                &#10094;
              </button>

              <div className="lightbox-image-container">
                <img
                  src={currentItem.src}
                  alt={currentItem.alt || currentItem.title}
                />
              </div>

              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={nextImage}
                aria-label="Next Image"
              >
                &#10095;
              </button>

              <div className="lightbox-caption">
                <h4>{currentItem.title || currentItem.alt}</h4>
                {currentItem.description && <p>{currentItem.description}</p>}
                <span className="lightbox-counter">
                  {activeLightboxIndex + 1} of {items.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
