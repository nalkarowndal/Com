import { useState } from 'react';
import GalleryItem from './GalleryItem';
import Lightbox from './Lightbox';

export default function GalleryGrid({ items = [] }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const handleOpen = (index) => {
    setLightboxIndex(index);
  };

  const handleClose = () => {
    setLightboxIndex(null);
  };

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="gallery-section" aria-label="Architectural Photography Gallery">
      <div className="row gallery-grid">
        {items.map((item, index) => (
          <GalleryItem
            key={item.id || item.src}
            src={item.src}
            alt={item.alt}
            title={item.title}
            index={index}
            onClick={() => handleOpen(index)}
          />
        ))}
      </div>

      <Lightbox
        isOpen={lightboxIndex !== null}
        images={items}
        currentIndex={lightboxIndex || 0}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
}
