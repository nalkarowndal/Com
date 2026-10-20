import { useState } from 'react';

const MEDIA_ASSETS = [
  {
    id: 'asset-logo',
    src: '/images/logo.png',
    alt: 'PRISM Brand Identity Logo',
    type: 'Brand Asset',
    dimensions: '132 x 30',
    status: 'Core Invariant (Locked)'
  },
  {
    id: 'asset-hero',
    src: '/images/hero.jpg',
    alt: 'Urban Strorkes architectural facade by Sebastian Weiss',
    type: 'Monograph Cover',
    dimensions: '1920 x 1080',
    status: 'Core Invariant (Locked)'
  },
  {
    id: 'asset-gal-1',
    src: '/images/gallery-1.jpg',
    alt: 'Spiral architectural concrete staircase',
    type: 'Permanent Collection',
    dimensions: '800 x 800',
    status: 'Core Invariant (Locked)'
  },
  {
    id: 'asset-gal-2',
    src: '/images/gallery-2.jpg',
    alt: 'Suspension bridge perspective view at dawn',
    type: 'Permanent Collection',
    dimensions: '800 x 800',
    status: 'Core Invariant (Locked)'
  },
  {
    id: 'asset-gal-3',
    src: '/images/gallery-3.jpg',
    alt: 'Geometric angular modern building facade',
    type: 'Permanent Collection',
    dimensions: '800 x 800',
    status: 'Core Invariant (Locked)'
  },
  {
    id: 'asset-gal-4',
    src: '/images/gallery-4.jpg',
    alt: 'Curved skyscraper glass window grid reflections',
    type: 'Permanent Collection',
    dimensions: '800 x 800',
    status: 'Core Invariant (Locked)'
  }
];

export default function AdminMediaPage() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="admin-media-view">
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Media & Photographic Assets</h1>
          <p className="admin-view-desc">
            Visual archive repository preserving original high-resolution photographic monographs.
          </p>
        </div>
      </div>

      <div className="admin-notice-banner">
        <strong>Content Preservation Policy:</strong> The original photographic assets (hero and gallery 1-4) are permanent baseline assets. They are safeguarded against accidental deletion.
      </div>

      <div className="admin-media-grid">
        {MEDIA_ASSETS.map((asset) => (
          <div key={asset.id} className="media-asset-card" onClick={() => setSelectedAsset(asset)}>
            <div className="media-preview-box">
              <img src={asset.src} alt={asset.alt} loading="lazy" />
            </div>
            <div className="media-card-body">
              <div className="media-meta-top">
                <span className="media-type-tag">{asset.type}</span>
                <span className="media-dim">{asset.dimensions}</span>
              </div>
              <h3 className="media-src-title">{asset.src}</h3>
              <p className="media-alt-text">"{asset.alt}"</p>
              <div className="media-status-badge">{asset.status}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedAsset && (
        <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="modal-dialog lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedAsset(null)}
            >
              &times;
            </button>
            <div className="lightbox-image-container">
              <img src={selectedAsset.src} alt={selectedAsset.alt} />
            </div>
            <div className="lightbox-caption">
              <h4>{selectedAsset.src}</h4>
              <p>{selectedAsset.alt} ({selectedAsset.dimensions})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
