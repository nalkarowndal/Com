import { useOutletContext } from 'react-router-dom';
import HeroSection from '../components/hero/HeroSection';
import FeaturedSection from '../components/content/FeaturedSection';
import GalleryGrid from '../components/gallery/GalleryGrid';
import { useHomeContent } from '../hooks/useHomeContent';

export default function HomePage() {
  const context = useOutletContext();
  const fallback = useHomeContent();
  const content = context?.content || fallback.content;

  return (
    <div className="home-page-container">
      <HeroSection
        badge={content.hero?.badge}
        author={content.hero?.author}
        title={content.hero?.title}
        buttonText={content.hero?.buttonText}
        backgroundImage={content.hero?.backgroundImage}
        content={content.hero?.content}
      />

      <FeaturedSection cards={content.cards} />

      <GalleryGrid items={content.gallery} />
    </div>
  );
}
