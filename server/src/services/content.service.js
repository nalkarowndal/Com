import { contentRepository } from '../repositories/content.repository.js';

export class ContentService {
  async getHomePayload() {
    const [site, navigation, articlesData, cards, gallery, footer] = await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getNavigation(),
      contentRepository.getArticles({ limit: 10 }),
      contentRepository.getFeaturedCards(),
      contentRepository.getGalleryItems(),
      contentRepository.getFooter()
    ]);

    const articles = articlesData.items || articlesData;
    const hero = articles.find((a) => a.isFeatured) || articles[0];

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
    return contentRepository.getCategories();
  }

  async getCategoryBySlug(slug) {
    return contentRepository.getCategoryBySlug(slug);
  }

  async getArticles(params = {}) {
    return contentRepository.getArticles(params);
  }

  async getArticleBySlug(slug) {
    return contentRepository.getArticleBySlug(slug);
  }

  async getGallery(params = {}) {
    return contentRepository.getGalleryItems(params);
  }

  async search(params = {}) {
    return contentRepository.getArticles(params);
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

  async createArticle(data, performedBy = 'admin') {
    const created = await contentRepository.createArticle(data);
    await contentRepository.createAuditLog('CREATE_ARTICLE', 'article', created.id, data, performedBy);
    return created;
  }

  async updateArticle(id, updates, performedBy = 'admin') {
    const updated = await contentRepository.updateArticle(id, updates);
    if (updated) {
      await contentRepository.createAuditLog('UPDATE_ARTICLE', 'article', id, updates, performedBy);
    }
    return updated;
  }

  async deleteArticle(id, performedBy = 'admin') {
    const success = await contentRepository.deleteArticle(id);
    if (success) {
      await contentRepository.createAuditLog('DELETE_ARTICLE', 'article', id, { deleted: true }, performedBy);
    }
    return success;
  }

  async getAuditLogs() {
    return contentRepository.getAuditLogs();
  }

  async getAdminStats() {
    return contentRepository.getAdminStats();
  }
}

export const contentService = new ContentService();
