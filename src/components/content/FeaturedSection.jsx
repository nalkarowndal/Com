import ContentCard from './ContentCard';

export default function FeaturedSection({ cards = [] }) {
  return (
    <section className="featured-section" aria-label="Featured Articles">
      <div className="row cards-row">
        {cards.map((card) => (
          <ContentCard
            key={card.id || card.title}
            variant={card.variant}
            title={card.title}
            description={card.description}
            buttonText={card.buttonText}
            link={card.link}
            fullText={card.fullText}
          />
        ))}
      </div>
    </section>
  );
}
