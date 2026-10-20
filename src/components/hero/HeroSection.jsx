import { useState } from 'react';
import Modal from '../common/Modal';

export default function HeroSection({
  badge = "Editor's Choice",
  author = "Sebastian Weiss",
  title = "Urban Strorkes",
  buttonText = "Read More",
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
                <a
                  href="#"
                  className="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsArticleOpen(true);
                  }}
                  role="button"
                  aria-haspopup="dialog"
                >
                  {buttonText}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessible Detail Modal for Read More */}
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
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button
              type="button"
              className="button"
              style={{
                color: 'var(--color-primary-charcoal)',
                borderColor: 'var(--color-primary-charcoal)'
              }}
              onClick={() => setIsArticleOpen(false)}
            >
              Close Story
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
