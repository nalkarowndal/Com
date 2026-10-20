import { getFileDbCache, saveFileDb, getPgPool, getDbStatus } from '../config/database.js';

export class ContentRepository {
  async getSiteSettings() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT key, value FROM site_settings');
      const settings = {};
      res.rows.forEach((r) => {
        settings[r.key] = r.value;
      });
      return settings;
    }
    const db = getFileDbCache();
    return db.site;
  }

  async getNavigation() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM navigation_items WHERE is_active = true ORDER BY order_index ASC'
      );
      return res.rows;
    }
    const db = getFileDbCache();
    return db.navigation;
  }

  async getCategories() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC'
      );
      return res.rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        heroImage: r.hero_image,
        order: r.sort_order,
        isActive: r.is_active
      }));
    }
    const db = getFileDbCache();
    return db.categories || [];
  }

  async getCategoryBySlug(slug) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM categories WHERE slug = $1 LIMIT 1', [slug]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        heroImage: r.hero_image,
        order: r.sort_order,
        isActive: r.is_active
      };
    }
    const db = getFileDbCache();
    return (db.categories || []).find((c) => c.slug === slug) || null;
  }

  async getArticles({ category = null, q = null, tag = null, page = 1, limit = 20, sort = 'latest' } = {}) {
    const isViewsSort = sort === 'views' || sort === 'popular';
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const conditions = ['is_published = true'];
      const values = [];

      if (category && category !== 'all') {
        values.push(category);
        conditions.push(`category_slug = $${values.length}`);
      }

      if (tag && tag !== 'all') {
        values.push(`%${tag.trim()}%`);
        conditions.push(`tags ILIKE $${values.length}`);
      }

      if (q && q.trim()) {
        values.push(`%${q.trim()}%`);
        conditions.push(`(title ILIKE $${values.length} OR content ILIKE $${values.length} OR tags ILIKE $${values.length})`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const orderBy = isViewsSort
        ? 'ORDER BY views DESC, created_at DESC'
        : 'ORDER BY is_featured DESC, created_at DESC';

      const offset = (Math.max(1, page) - 1) * limit;
      values.push(limit);
      const limitParam = `$${values.length}`;
      values.push(offset);
      const offsetParam = `$${values.length}`;

      const countRes = await pool.query(`SELECT COUNT(*) FROM articles ${whereClause}`, values.slice(0, values.length - 2));
      const total = parseInt(countRes.rows[0].count, 10);

      const res = await pool.query(
        `SELECT * FROM articles ${whereClause} ${orderBy} LIMIT ${limitParam} OFFSET ${offsetParam}`,
        values
      );

      return {
        items: res.rows.map(r => ({
          id: r.id,
          slug: r.slug,
          categorySlug: r.category_slug,
          badge: r.badge,
          author: r.author,
          title: r.title,
          buttonText: r.button_text,
          imageSrc: r.image_src,
          excerpt: r.excerpt,
          content: r.content,
          tags: r.tags,
          isFeatured: r.is_featured,
          isPublished: r.is_published,
          isDemo: r.is_demo,
          views: r.views
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    // File persistent storage query
    const db = getFileDbCache();
    let list = (db.articles || []).filter((a) => a.isPublished !== false);

    if (category && category !== 'all') {
      list = list.filter((a) => a.categorySlug === category);
    }

    if (tag && tag !== 'all') {
      const tagLower = tag.trim().toLowerCase();
      list = list.filter((a) => a.tags && a.tags.toLowerCase().includes(tagLower));
    }

    if (q && q.trim()) {
      const keyword = q.trim().toLowerCase();
      list = list.filter((a) =>
        (a.title && a.title.toLowerCase().includes(keyword)) ||
        (a.content && a.content.toLowerCase().includes(keyword)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(keyword)) ||
        (a.tags && a.tags.toLowerCase().includes(keyword))
      );
    }

    if (isViewsSort) {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const total = list.length;
    const offset = (Math.max(1, page) - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getArticleBySlug(slug) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM articles WHERE slug = $1 LIMIT 1', [slug]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        slug: r.slug,
        categorySlug: r.category_slug,
        badge: r.badge,
        author: r.author,
        title: r.title,
        buttonText: r.button_text,
        imageSrc: r.image_src,
        excerpt: r.excerpt,
        content: r.content,
        tags: r.tags,
        isFeatured: r.is_featured,
        isPublished: r.is_published,
        isDemo: r.is_demo,
        views: r.views
      };
    }
    const db = getFileDbCache();
    return (db.articles || []).find((a) => a.slug === slug || a.id === slug) || null;
  }

  async getFeaturedCards() {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query('SELECT * FROM featured_contents ORDER BY order_index ASC');
      return res.rows.map(r => ({
        id: r.id,
        variant: r.variant,
        title: r.title,
        description: r.description,
        buttonText: r.button_text,
        link: r.link,
        order: r.order_index
      }));
    }
    const db = getFileDbCache();
    return db.cards;
  }

  async getGalleryItems({ category = null } = {}) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      let query = 'SELECT * FROM gallery_items WHERE is_published = true';
      const params = [];
      if (category && category !== 'all') {
        params.push(category);
        query += ` AND category_slug = $${params.length}`;
      }
      query += ' ORDER BY order_index ASC';
      const res = await pool.query(query, params);
      return res.rows.map(r => ({
        id: r.id,
        src: r.src,
        alt: r.alt,
        title: r.title,
        description: r.description,
        categorySlug: r.category_slug,
        order: r.order_index,
        isPublished: r.is_published,
        isDemo: r.is_demo
      }));
    }
    const db = getFileDbCache();
    let list = (db.gallery || []).filter((g) => g.isPublished !== false);
    if (category && category !== 'all') {
      list = list.filter((g) => g.categorySlug === category);
    }
    return list;
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
      return res.rows.map(r => ({
        id: r.id,
        action: r.action,
        entity: r.target_entity,
        targetId: r.target_id,
        details: r.details,
        performedBy: r.performed_by,
        timestamp: r.created_at
      }));
    }
    const db = getFileDbCache();
    return db.auditLogs || [];
  }

  async updateArticle(id, updates) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const fields = [];
      const values = [];
      let idx = 1;

      if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
      if (updates.badge !== undefined) { fields.push(`badge = $${idx++}`); values.push(updates.badge); }
      if (updates.author !== undefined) { fields.push(`author = $${idx++}`); values.push(updates.author); }
      if (updates.buttonText !== undefined) { fields.push(`button_text = $${idx++}`); values.push(updates.buttonText); }
      if (updates.content !== undefined) { fields.push(`content = $${idx++}`); values.push(updates.content); }
      if (updates.excerpt !== undefined) { fields.push(`excerpt = $${idx++}`); values.push(updates.excerpt); }
      if (updates.tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(updates.tags); }
      if (updates.categorySlug !== undefined) { fields.push(`category_slug = $${idx++}`); values.push(updates.categorySlug); }
      if (updates.isPublished !== undefined) { fields.push(`is_published = $${idx++}`); values.push(Boolean(updates.isPublished)); }

      if (fields.length > 0) {
        values.push(id);
        const query = `UPDATE articles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} OR slug = $${idx} RETURNING *`;
        await pool.query(query, values);
      }
    }

    const db = getFileDbCache();
    const article = (db.articles || []).find((a) => a.id === id || a.slug === id);
    if (!article) return null;

    Object.assign(article, updates);
    await saveFileDb();
    return article;
  }

  async createArticle(data) {
    const newArticle = {
      id: data.id || `art-${Date.now()}`,
      slug: data.slug || `story-${Date.now()}`,
      categorySlug: data.categorySlug || 'architecture',
      badge: data.badge || 'Editorial',
      author: data.author || 'PRISM Editorial Staff',
      title: data.title,
      buttonText: data.buttonText || 'Read More',
      imageSrc: data.imageSrc || '/images/hero.jpg',
      excerpt: data.excerpt || '',
      content: data.content || '',
      tags: data.tags || '',
      isFeatured: Boolean(data.isFeatured),
      isPublished: data.isPublished !== false,
      isDemo: Boolean(data.isDemo),
      views: 0
    };

    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO articles (id, slug, category_slug, badge, author, title, button_text, image_src, excerpt, content, tags, is_featured, is_published, is_demo, views)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newArticle.id,
          newArticle.slug,
          newArticle.categorySlug,
          newArticle.badge,
          newArticle.author,
          newArticle.title,
          newArticle.buttonText,
          newArticle.imageSrc,
          newArticle.excerpt,
          newArticle.content,
          newArticle.tags,
          newArticle.isFeatured,
          newArticle.isPublished,
          newArticle.isDemo,
          0
        ]
      );
    }

    const db = getFileDbCache();
    if (!db.articles) db.articles = [];
    db.articles.push(newArticle);
    await saveFileDb();
    return newArticle;
  }

  async deleteArticle(id) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query('DELETE FROM articles WHERE id = $1 OR slug = $1', [id]);
    }

    const db = getFileDbCache();
    const idx = (db.articles || []).findIndex((a) => a.id === id || a.slug === id);
    if (idx !== -1) {
      db.articles.splice(idx, 1);
      await saveFileDb();
      return true;
    }
    return false;
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

    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      try {
        await pool.query(
          `INSERT INTO audit_logs (action, target_entity, target_id, details, performed_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [action, entity, String(targetId), JSON.stringify(details), performedBy]
        );
      } catch (e) {
        console.warn('[AuditLog Postgres write error]:', e.message);
      }
    }

    const db = getFileDbCache();
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(log);
    await saveFileDb();
    return log;
  }

  async getAdminStats() {
    const db = getFileDbCache();
    const articles = db.articles || [];
    const categories = db.categories || [];
    const gallery = db.gallery || [];
    const logs = db.auditLogs || [];

    const categoryCounts = {};
    categories.forEach((c) => {
      categoryCounts[c.slug] = articles.filter((a) => a.categorySlug === c.slug).length;
    });

    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => a.isPublished !== false).length,
      draftArticles: articles.filter((a) => a.isPublished === false).length,
      totalCategories: categories.length,
      totalGalleryItems: gallery.length,
      totalAuditLogs: logs.length,
      categoryBreakdown: categoryCounts
    };
  }
}

export const contentRepository = new ContentRepository();
