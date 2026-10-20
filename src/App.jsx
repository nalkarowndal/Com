import { useState } from 'react';
import Header from './components/layout/Header';
import HeroSection from './components/hero/HeroSection';
import FeaturedSection from './components/content/FeaturedSection';
import GalleryGrid from './components/gallery/GalleryGrid';
import Footer from './components/layout/Footer';
import AdminModal from './components/admin/AdminModal';
import { useHomeContent } from './hooks/useHomeContent';

function App() {
  const { content, auditLogs, updateContentFromAdmin } = useHomeContent();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="site-wrapper">
      <Header
        brandLogoSrc={content.project?.brandLogoSrc || '/images/logo.png'}
        brandLogoAlt={content.project?.brandLogoAlt || 'Logo'}
        navigation={content.navigation}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main id="main-content">
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
      </main>

      <Footer
        copyright={content.footer?.copyright}
        description={content.footer?.description}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        content={content}
        onSaveContent={updateContentFromAdmin}
        auditLogs={auditLogs}
      />
    </div>
  );
}

export default App;
