import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';

export default function ContentCard({
  variant = 'tan', // 'tan' or 'dark'
  title = 'Inspring Reads',
  description = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus',
  buttonText = 'Read More',
  link = '',
  fullText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum, est doloribus'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const boxClass = variant === 'tan' ? 'info-box-tan' : 'info-box-dark';

  return (
    <>
      <div className="col col-md-one-half">
        <div className={boxClass}>
          <h2>{title}</h2>
          <p>{description}</p>
          {link ? (
            <Link to={link} className="button">
              {buttonText}
            </Link>
          ) : (
            <button
              type="button"
              className="button"
              aria-haspopup="dialog"
              onClick={() => setIsOpen(true)}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
      >
        <div className="article-modal-content">
          <span className="modal-badge">{variant.toUpperCase()} EDITION</span>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-body-text">{description}</p>
          {fullText && fullText !== description && (
            <p className="modal-body-text" style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>
              {fullText}
            </p>
          )}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              type="button"
              className="button"
              style={{
                color: 'var(--color-primary-charcoal)',
                borderColor: 'var(--color-primary-charcoal)'
              }}
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
