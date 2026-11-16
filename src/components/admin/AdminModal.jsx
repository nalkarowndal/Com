import { useState } from 'react';
import Modal from '../common/Modal';

export default function AdminModal({
  isOpen,
  onClose,
  content,
  onSaveContent,
  auditLogs = []
}) {
  const [formData, setFormData] = useState({
    heroTitle: content.hero?.title || '',
    heroBadge: content.hero?.badge || '',
    heroAuthor: content.hero?.author || '',
    card1Title: content.cards?.[0]?.title || '',
    card1Desc: content.cards?.[0]?.description || '',
    card2Title: content.cards?.[1]?.title || '',
    card2Desc: content.cards?.[1]?.description || '',
    footerCopyright: content.footer?.copyright || '',
    footerDesc: content.footer?.description || ''
  });

  const [activeTab, setActiveTab] = useState('edit');
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveContent) {
      onSaveContent(formData);
      setSaveMessage('Content successfully updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="HBK Content Administration"
    >
      <div className="admin-modal-card">
        <div className="admin-header">
          <div>
            <h2>Content Management</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              HBK Editorial System &bull; company Project
            </p>
          </div>
          <span className="status-badge">Authenticated</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className="button"
            style={{
              padding: '6px 16px',
              fontSize: '0.8rem',
              color: activeTab === 'edit' ? 'var(--color-white)' : 'var(--color-primary-charcoal)',
              backgroundColor: activeTab === 'edit' ? 'var(--color-primary-charcoal)' : 'transparent',
              borderColor: 'var(--color-primary-charcoal)'
            }}
            onClick={() => setActiveTab('edit')}
          >
            Edit Content
          </button>
          <button
            type="button"
            className="button"
            style={{
              padding: '6px 16px',
              fontSize: '0.8rem',
              color: activeTab === 'audit' ? 'var(--color-white)' : 'var(--color-primary-charcoal)',
              backgroundColor: activeTab === 'audit' ? 'var(--color-primary-charcoal)' : 'transparent',
              borderColor: 'var(--color-primary-charcoal)'
            }}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {saveMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '0.875rem'
            }}
          >
            {saveMessage}
          </div>
        )}

        {activeTab === 'edit' ? (
          <form onSubmit={handleSave}>
            <div className="admin-form-group">
              <label htmlFor="heroTitle">Hero Story Title</label>
              <input
                id="heroTitle"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group">
                <label htmlFor="heroBadge">Hero Badge</label>
                <input
                  id="heroBadge"
                  name="heroBadge"
                  value={formData.heroBadge}
                  onChange={handleChange}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="heroAuthor">Hero Author / Photographer</label>
                <input
                  id="heroAuthor"
                  name="heroAuthor"
                  value={formData.heroAuthor}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="card1Title">Card 1 Title (Tan Box)</label>
              <input
                id="card1Title"
                name="card1Title"
                value={formData.card1Title}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="card1Desc">Card 1 Description</label>
              <textarea
                id="card1Desc"
                name="card1Desc"
                value={formData.card1Desc}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="card2Title">Card 2 Title (Dark Box)</label>
              <input
                id="card2Title"
                name="card2Title"
                value={formData.card2Title}
                onChange={handleChange}
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="card2Desc">Card 2 Description</label>
              <textarea
                id="card2Desc"
                name="card2Desc"
                value={formData.card2Desc}
                onChange={handleChange}
              />
            </div>

            <div className="admin-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="audit-log-section">
            <h3>Recent System Modifications</h3>
            {auditLogs.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                No modification events recorded. Baseline content is intact.
              </p>
            ) : (
              auditLogs.map((log, index) => (
                <div key={index} className="log-item">
                  <span>{log.action} ({log.entity})</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
