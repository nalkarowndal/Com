import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';

export default function HeroSection({
  badge = "Editor's Choice",
  author = "Sebastian Weiss",
  title = "Urban Strorkes",
  buttonText = "Read More",
  linkTo = "/stories/urban-strorkes",
  backgroundImage = "/images/hero.jpg",
  content = "Urban Strorkes is an acclaimed photographic exploration of contemporary metropolitan form and organic geometry by photographer Sebastian Weiss. Through minimalist framing, dramatic natural lighting, and architectural abstractions, the series uncovers sculptural rhythms within everyday urban structures."
}) {
  const [isArticleOpen, setIsArticleOpen] = useState(false);

  return (
    <>
      <section className="hero-wrapper" aria-label="Featured Story">
        <div className="row">
          <div className="col">
            <div
              className="hero"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            >
              <div className="hero-content">
                <h3 className="hero-badge">{badge}</h3>
                <h4 className="hero-author">{author}</h4>
                <h1 className="hero-title">{title}</h1>
                <div className="hero-actions-row">
                  <Link
                    to={linkTo}
                    className="button"
                    aria-label={`Read full monograph: ${title}`}
                  >
                    {buttonText}
                  </Link>
                  <button
                    type="button"
                    className="hero-synopsis-btn"
                    onClick={() => setIsArticleOpen(true)}
                    aria-haspopup="dialog"
                    aria-label={`Quick synopsis for ${title}`}
                  >
                    Quick Synopsis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Detail Modal for Quick Synopsis */}
      <Modal
        isOpen={isArticleOpen}
        onClose={() => setIsArticleOpen(false)}
        title={`${title} - ${author}`}
      >
        <div className="article-modal-content">
          <span className="modal-badge">{badge}</span>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-author">Curation by {author}</p>
          <p className="modal-body-text">{content}</p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              type="button"
              className="button"
              style={{
                color: 'var(--color-primary-charcoal)',
                borderColor: 'var(--color-primary-charcoal)'
              }}
              onClick={() => setIsArticleOpen(false)}
            >
              Close
            </button>
            <Link
              to={linkTo}
              className="button"
              style={{
                background: 'var(--color-accent-champagne)',
                color: 'var(--color-primary-charcoal)',
                borderColor: 'var(--color-accent-champagne)'
              }}
              onClick={() => setIsArticleOpen(false)}
            >
              Open Full Monograph &rarr;
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
