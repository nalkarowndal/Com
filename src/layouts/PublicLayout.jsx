import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdminModal from '../components/admin/AdminModal';
import { useHomeContent } from '../hooks/useHomeContent';

export default function PublicLayout() {
  const { content, auditLogs, updateContentFromAdmin } = useHomeContent();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <div className="site-wrapper">
      <ScrollRestoration />

      <Header
        brandLogoSrc={content.project?.brandLogoSrc || '/images/logo.png'}
        brandLogoAlt={content.project?.brandLogoAlt || 'Logo'}
        navigation={content.navigation}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <main id="main-content" className="public-main-content">
        <Outlet context={{ content, auditLogs, updateContentFromAdmin }} />
      </main>

      <Footer
        copyright={content.footer?.copyright}
        description={content.footer?.description}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        content={content}
        onSaveContent={updateContentFromAdmin}
        auditLogs={auditLogs}
      />
    </div>
  );
}
