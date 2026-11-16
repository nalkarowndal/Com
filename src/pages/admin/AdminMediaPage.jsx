import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  apiAdminGetMedia,
  apiAdminGetMediaById,
  apiAdminUploadMedia,
  apiAdminUpdateMedia,
  apiAdminDeleteMedia,
  apiAdminDetectDuplicateMedia
} from '../../services/api';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetail, setAssetDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('all');

  // Upload UI state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('architecture');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadPhotographer, setUploadPhotographer] = useState('');
  const [uploadSourceName, setUploadSourceName] = useState('');
  const [uploadSourceUrl, setUploadSourceUrl] = useState('');
  const [uploadLicenseType, setUploadLicenseType] = useState('Editorial Rights');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Action message
  const [actionNotice, setActionNotice] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fileInputRef = useRef(null);

  // Load media items from API
  useEffect(() => {
    let isMounted = true;
    async function loadMedia() {
      try {
        setLoading(true);
        const res = await apiAdminGetMedia({
          category: selectedCategory === 'all' ? null : selectedCategory,
          search: searchQuery || null,
          limit: 100
        });
        if (isMounted) {
          setMediaList(res.items || []);
        }
      } catch (err) {
        console.error('Failed to load media in admin:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMedia();
    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery, refreshTrigger]);

  // Load detailed asset relations when an asset is selected
  useEffect(() => {
    if (!selectedAsset) return;
    let isMounted = true;
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const detail = await apiAdminGetMediaById(selectedAsset.id);
        if (isMounted) setAssetDetail(detail);
      } catch {
        if (isMounted) setAssetDetail(selectedAsset);
      } finally {
        if (isMounted) setDetailLoading(false);
      }
    }
    loadDetail();
    return () => { isMounted = false; };
  }, [selectedAsset]);

  // Handle file selection and duplicate check
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '));
    }
    setDuplicateWarning(null);

    try {
      const dup = await apiAdminDetectDuplicateMedia({
        filename: file.name,
        fileSize: file.size
      });
      if (dup?.isDuplicate && dup.match) {
        setDuplicateWarning(`Potential duplicate detected matching existing asset: "${dup.match.title || dup.match.filename}"`);
      }
    } catch {
      // Ignore duplicate check error
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an image file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('categorySlug', uploadCategory);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('alt', uploadAlt || uploadTitle || '');
      formData.append('photographer', uploadPhotographer || 'Staff Photographer');
      formData.append('sourceName', uploadSourceName || 'Staff Upload');
      formData.append('sourceUrl', uploadSourceUrl || '');
      formData.append('licenseType', uploadLicenseType);
      if (ignoreDuplicate) {
        formData.append('ignoreDuplicate', 'true');
      }

      await apiAdminUploadMedia(formData);
      setActionNotice({ type: 'success', text: `Media asset "${uploadTitle || uploadFile.name}" successfully uploaded.` });
      setShowUploadForm(false);
      resetUploadForm();
      setRefreshTrigger(k => k + 1);
    } catch (err) {
      setActionNotice({ type: 'error', text: `Upload failed: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadAlt('');
    setUploadPhotographer('');
    setUploadSourceName('');
    setUploadSourceUrl('');
    setUploadLicenseType('Editorial Rights');
    setDuplicateWarning(null);
    setIgnoreDuplicate(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAsset = async (asset) => {
    if (asset.isOriginal) {
      alert('This is a baseline brand invariant asset and cannot be deleted.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${asset.title || asset.filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiAdminDeleteMedia(asset.id);
      setActionNotice({ type: 'success', text: `Asset "${asset.title}" was permanently removed.` });
      setSelectedAsset(null);
      setRefreshTrigger(k => k + 1);
    } catch (err) {
      setActionNotice({ type: 'error', text: `Failed to delete: ${err.message}` });
    }
  };

  const handleSaveMetadata = async () => {
    if (!assetDetail) return;
    try {
      await apiAdminUpdateMedia(assetDetail.id, {
        title: assetDetail.title,
        alt: assetDetail.alt,
        categorySlug: assetDetail.categorySlug,
        photographer: assetDetail.photographer,
        licenseType: assetDetail.licenseType
      });
      setActionNotice({ type: 'success', text: `Asset metadata for "${assetDetail.title}" updated.` });
      setRefreshTrigger(k => k + 1);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setActionNotice({ type: 'success', text: `Copied path to clipboard: ${text}` });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filtered in-memory list (combining category, query, license)
  const displayedMedia = mediaList.filter((item) => {
    if (licenseFilter !== 'all' && item.licenseType !== licenseFilter) return false;
    return true;
  });

  return (
    <div className="admin-media-view">
      {/* Header */}
      <div className="admin-view-header">
        <div>
          <h1 className="admin-view-title">Media & Photographic Assets</h1>
          <p className="admin-view-desc">
            Visual archive repository with category curation, license governance, and ingestion pipeline.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn-admin-primary"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{showUploadForm ? 'Close Upload Tray' : 'Upload Media Asset'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={actionNotice.type === 'error' ? 'admin-alert-error' : 'admin-alert-success'}
          role="alert"
        >
          {actionNotice.text}
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setActionNotice(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Baseline Invariant Notice */}
      <div className="admin-notice-banner">
        <strong>Preservation Policy:</strong> The 5 original baseline photographic monographs (hero and gallery 1-4) are permanent platform invariants. They are cryptographically and administratively locked against accidental modification or deletion.
      </div>

      {/* Ingestion & Upload Tray */}
      {showUploadForm && (
        <div className="admin-upload-panel">
          <h2 className="admin-upload-title">Ingest Editorial Photography</h2>
          <p className="admin-upload-subtitle">
            Upload high-resolution photography with mandatory license and category tagging.
          </p>

          <form onSubmit={handleUploadSubmit} className="admin-upload-form">
            <div className="upload-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                id="media-file-input"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                required
              />
              <label htmlFor="media-file-input" className="dropzone-label">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {uploadFile ? (
                  <span className="file-selected-name">
                    <strong>Selected:</strong> {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <span>Click or drag image file here (JPEG, PNG, WebP up to 10MB)</span>
                )}
              </label>
            </div>

            {duplicateWarning && (
              <div className="admin-alert-warning">
                {duplicateWarning}
                <label className="checkbox-item inline-check">
                  <input
                    type="checkbox"
                    checked={ignoreDuplicate}
                    onChange={(e) => setIgnoreDuplicate(e.target.checked)}
                  />
                  <span>Upload anyway (override duplicate detection)</span>
                </label>
              </div>
            )}

            <div className="form-grid-3">
              <div className="form-group">
                <label htmlFor="upload-category">Discipline Category *</label>
                <select
                  id="upload-category"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  <option value="architecture">Architecture</option>
                  <option value="travel">Travel</option>
                  <option value="art">Art</option>
                  <option value="food">Food</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="upload-title">Asset Title *</label>
                <input
                  id="upload-title"
                  type="text"
                  required
                  placeholder="e.g. Kyoto Wooden Pavilions"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="upload-photographer">Photographer / Creator *</label>
                <input
                  id="upload-photographer"
                  type="text"
                  required
                  placeholder="e.g. Su San Lee"
                  value={uploadPhotographer}
                  onChange={(e) => setUploadPhotographer(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label htmlFor="upload-license">License Type *</label>
                <select
                  id="upload-license"
                  value={uploadLicenseType}
                  onChange={(e) => setUploadLicenseType(e.target.value)}
                >
                  <option value="Editorial Rights">Editorial Rights</option>
                  <option value="Unsplash License">Unsplash License (Free Editorial)</option>
                  <option value="Brand Proprietary">Brand Proprietary</option>
                  <option value="Creative Commons BY-SA 4.0">Creative Commons BY-SA 4.0</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="upload-source-name">Source Platform</label>
                <input
                  id="upload-source-name"
                  type="text"
                  placeholder="e.g. Unsplash Curated / Staff Commission"
                  value={uploadSourceName}
                  onChange={(e) => setUploadSourceName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="upload-source-url">Source Verification URL</label>
                <input
                  id="upload-source-url"
                  type="url"
                  placeholder="https://unsplash.com/photos/..."
                  value={uploadSourceUrl}
                  onChange={(e) => setUploadSourceUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="upload-alt">Accessibility Alt Description *</label>
              <input
                id="upload-alt"
                type="text"
                required
                placeholder="Descriptive explanation for screen-readers and visual QA..."
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
              />
            </div>

            <div className="upload-form-actions">
              <button
                type="submit"
                className="btn-admin-submit"
                disabled={uploading || !uploadFile}
              >
                {uploading ? 'Ingesting Media...' : 'Complete Ingestion'}
              </button>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => { setShowUploadForm(false); resetUploadForm(); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="admin-table-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search media by title, photographer, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pill-group">
          {['all', 'architecture', 'travel', 'art', 'food'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="license-select">
          <select value={licenseFilter} onChange={(e) => setLicenseFilter(e.target.value)}>
            <option value="all">All Licenses</option>
            <option value="Editorial Rights">Editorial Rights</option>
            <option value="Unsplash License">Unsplash License</option>
            <option value="Brand Proprietary">Brand Proprietary</option>
          </select>
        </div>
      </div>

      {/* Grid of Media Assets */}
      {loading ? (
        <div className="admin-page-loading">
          <LoadingSpinner />
        </div>
      ) : displayedMedia.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No Media Assets Found</h3>
          <p>No photography matches the current search and filter criteria.</p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {displayedMedia.map((asset) => (
            <div
              key={asset.id}
              className={`media-asset-card ${asset.isOriginal ? 'is-original' : ''}`}
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="media-preview-box">
                <img src={asset.src} alt={asset.alt || asset.title} loading="lazy" />
                {asset.isOriginal && (
                  <div className="media-lock-badge" title="Permanent baseline invariant">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                    <span>LOCKED</span>
                  </div>
                )}
              </div>

              <div className="media-card-body">
                <div className="media-meta-top">
                  <span className={`media-cat-badge cat-${asset.categorySlug || 'architecture'}`}>
                    {(asset.categorySlug || 'arch').toUpperCase()}
                  </span>
                  <span className="media-dim">
                    {asset.width && asset.height ? `${asset.width} × ${asset.height}` : 'Resolution N/A'}
                  </span>
                </div>

                <h3 className="media-src-title" title={asset.title}>
                  {asset.title || asset.filename}
                </h3>
                <p className="media-alt-text">"{asset.alt || 'No alt text provided'}"</p>

                <div className="media-meta-bottom">
                  <span className="media-author-tag">By {asset.photographer || 'HBK Archive'}</span>
                  <span className="media-license-tag">{asset.licenseType || 'Editorial'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Inspector & Metadata Modal */}
      {selectedAsset && (
        <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="modal-dialog media-inspector-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedAsset(null)}
              aria-label="Close Inspector"
            >
              &times;
            </button>

            <div className="inspector-layout">
              {/* Left: Image Lightbox */}
              <div className="inspector-preview-col">
                <div className="inspector-img-wrap">
                  <img src={selectedAsset.src} alt={selectedAsset.alt} />
                </div>
                <div className="inspector-path-bar">
                  <code>{selectedAsset.src}</code>
                  <button
                    type="button"
                    className="btn-copy-path"
                    onClick={() => copyToClipboard(selectedAsset.src)}
                  >
                    Copy Path
                  </button>
                </div>
              </div>

              {/* Right: Metadata & Governance */}
              <div className="inspector-meta-col">
                <div className="inspector-header">
                  <h3 className="inspector-title">{selectedAsset.title}</h3>
                  <span className={`media-cat-badge cat-${selectedAsset.categorySlug}`}>
                    {selectedAsset.categorySlug?.toUpperCase()}
                  </span>
                </div>

                {detailLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="inspector-fields">
                    <div className="meta-field-row">
                      <span className="meta-label">Asset ID:</span>
                      <span className="meta-val"><code>{selectedAsset.id}</code></span>
                    </div>

                    <div className="meta-field-row">
                      <span className="meta-label">Dimensions:</span>
                      <span className="meta-val">{selectedAsset.width} × {selectedAsset.height} px</span>
                    </div>

                    <div className="meta-field-row">
                      <span className="meta-label">File Size:</span>
                      <span className="meta-val">
                        {selectedAsset.fileSize ? `${(selectedAsset.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </span>
                    </div>

                    <div className="meta-field-row">
                      <span className="meta-label">Photographer:</span>
                      <span className="meta-val">{selectedAsset.photographer}</span>
                    </div>

                    <div className="meta-field-row">
                      <span className="meta-label">License:</span>
                      <span className="meta-val">
                        <strong>{selectedAsset.licenseType}</strong>
                        {selectedAsset.sourceUrl && (
                          <a
                            href={selectedAsset.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="license-external-link"
                          >
                            Verify Source &rarr;
                          </a>
                        )}
                      </span>
                    </div>

                    <div className="meta-field-row">
                      <span className="meta-label">Status:</span>
                      <span className="meta-val">
                        {selectedAsset.isOriginal ? (
                          <span className="badge-locked">Core Baseline Invariant (Permanent)</span>
                        ) : (
                          <span className="badge-active">Curated Library Asset</span>
                        )}
                      </span>
                    </div>

                    {assetDetail?.usage && (
                      <div className="inspector-usage-box">
                        <h4>Platform Usage References ({assetDetail.usage.totalUsage})</h4>
                        {assetDetail.usage.totalUsage === 0 ? (
                          <p className="no-usage-note">Not currently assigned to any article or gallery monograph.</p>
                        ) : (
                          <ul className="usage-list">
                            {assetDetail.usage.articles.map((art) => (
                              <li key={art.id}>
                                <strong>Article:</strong> {art.title} (<em>{art.categorySlug}</em>)
                              </li>
                            ))}
                            {assetDetail.usage.categories.map((c) => (
                              <li key={c.id}>
                                <strong>Category Hero:</strong> {c.name}
                              </li>
                            ))}
                            {assetDetail.usage.gallery.map((g) => (
                              <li key={g.id}>
                                <strong>Gallery:</strong> {g.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Metadata Edit Form */}
                    <div className="inspector-edit-section">
                      <h4>Update Metadata</h4>
                      <div className="form-group">
                        <label>Display Title</label>
                        <input
                          type="text"
                          value={assetDetail?.title || ''}
                          onChange={(e) => setAssetDetail({ ...assetDetail, title: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Accessibility Alt Description</label>
                        <textarea
                          rows="2"
                          value={assetDetail?.alt || ''}
                          onChange={(e) => setAssetDetail({ ...assetDetail, alt: e.target.value })}
                        />
                      </div>

                      <div className="inspector-btn-bar">
                        <button
                          type="button"
                          className="btn-admin-submit"
                          onClick={handleSaveMetadata}
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          className="btn-admin-delete"
                          disabled={selectedAsset.isOriginal}
                          title={selectedAsset.isOriginal ? 'Baseline invariant assets cannot be deleted' : 'Delete asset'}
                          onClick={() => handleDeleteAsset(selectedAsset)}
                        >
                          {selectedAsset.isOriginal ? 'Protected Invariant' : 'Delete Asset'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
