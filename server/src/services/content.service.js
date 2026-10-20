import { contentRepository } from '../repositories/content.repository.js';

export class ContentService {
  async getHomePayload() {
    const [site, navigation, articles, cards, gallery, footer] = await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getNavigation(),
      contentRepository.getArticles(),
      contentRepository.getFeaturedCards(),
      contentRepository.getGalleryItems(),
      contentRepository.getFooter()
    ]);

    const hero = articles.find(a => a.isFeatured) || articles[0];

    return {
      site,
      navigation,
      hero: {
        id: hero.id,
        slug: hero.slug,
        badge: hero.badge,
        author: hero.author,
        title: hero.title,
        buttonText: hero.buttonText || 'Read More',
        backgroundImage: hero.imageSrc || '/images/hero.jpg',
        content: hero.content
      },
      cards,
      gallery,
      footer
    };
  }

  async getCategories() {
    const nav = await contentRepository.getNavigation();
    return nav.map(item => ({
      id: item.id,
      name: item.label,
      slug: item.label.toLowerCase(),
      href: item.href,
      order: item.order
    }));
  }

  async getArticles() {
    return contentRepository.getArticles();
  }

  async getArticleBySlug(slug) {
    return contentRepository.getArticleBySlug(slug);
  }

  async getGallery() {
    return contentRepository.getGalleryItems();
  }

  async getSiteInfo() {
    const [site, footer] = await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getFooter()
    ]);
    return {
      ...site,
      copyright: footer.copyright,
      footerDescription: footer.description
    };
  }

  async updateArticle(id, updates, performedBy = 'admin') {
    const updated = await contentRepository.updateArticle(id, updates);
    if (updated) {
      await contentRepository.createAuditLog('UPDATE_ARTICLE', 'article', id, updates, performedBy);
    }
    return updated;
  }

  async getAuditLogs() {
    return contentRepository.getAuditLogs();
  }
}

export const contentService = new ContentService();
