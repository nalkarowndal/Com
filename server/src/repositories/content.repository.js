import { getFileDbCache, saveFileDb, getPgPool, getDbStatus } from '../config/database.js';

export class ContentRepository {
  async getSiteSettings() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT key, value FROM site_settings');
      const settings = {};
      res.rows.forEach(r => { settings[r.key] = r.value; });
      return settings;
    }
    const db = getFileDbCache();
    return db.site;
  }

  async getNavigation() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM navigation_items WHERE is_active = true ORDER BY order_index ASC');
      return res.rows;
    }
    const db = getFileDbCache();
    return db.navigation;
  }

  async getArticles() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM articles WHERE is_published = true ORDER BY created_at DESC');
      return res.rows;
    }
    const db = getFileDbCache();
    return db.articles;
  }

  async getArticleBySlug(slug) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM articles WHERE slug = $1 LIMIT 1', [slug]);
      return res.rows[0] || null;
    }
    const db = getFileDbCache();
    return db.articles.find(a => a.slug === slug) || null;
  }

  async getFeaturedCards() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM featured_contents ORDER BY order_index ASC');
      return res.rows;
    }
    const db = getFileDbCache();
    return db.cards;
  }

  async getGalleryItems() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM gallery_items WHERE is_published = true ORDER BY order_index ASC');
      return res.rows;
    }
    const db = getFileDbCache();
    return db.gallery;
  }

  async getFooter() {
    const db = getFileDbCache();
    return db.footer;
  }

  async getAuditLogs() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50');
      return res.rows;
    }
    const db = getFileDbCache();
    return db.auditLogs || [];
  }

  async updateArticle(id, updates) {
    const db = getFileDbCache();
    const article = db.articles.find(a => a.id === id || a.slug === id);
    if (!article) return null;

    Object.assign(article, updates);
    await saveFileDb();
    return article;
  }

  async updateFeaturedCard(id, updates) {
    const db = getFileDbCache();
    const card = db.cards.find(c => c.id === id);
    if (!card) return null;

    Object.assign(card, updates);
    await saveFileDb();
    return card;
  }

  async createAuditLog(action, entity, targetId, details, performedBy = 'admin') {
    const log = {
      id: Date.now(),
      action,
      entity,
      targetId,
      details,
      performedBy,
      timestamp: new Date().toISOString()
    };
    const db = getFileDbCache();
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(log);
    await saveFileDb();
    return log;
  }
}

export const contentRepository = new ContentRepository();
