import path from 'path';
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
      author: data.author || 'HBK Editorial Staff',
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

    const media = db.mediaAssets || [];

    return {
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => a.isPublished !== false).length,
      draftArticles: articles.filter((a) => a.isPublished === false).length,
      totalCategories: categories.length,
      totalGalleryItems: gallery.length,
      totalAuditLogs: logs.length,
      totalMediaAssets: media.length,
      categoryBreakdown: categoryCounts
    };
  }

  // ==========================================
  // Media Asset Management
  // ==========================================
  async getMediaAssets({ category = null, search = null, isApproved = null, isOriginal = null, page = 1, limit = 50 } = {}) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const conditions = [];
      const values = [];

      if (category && category !== 'all') {
        values.push(category);
        conditions.push(`category_slug = $${values.length}`);
      }
      if (search) {
        values.push(`%${search}%`);
        conditions.push(`(title ILIKE $${values.length} OR alt ILIKE $${values.length} OR photographer ILIKE $${values.length} OR filename ILIKE $${values.length})`);
      }
      if (isApproved !== null) {
        values.push(Boolean(isApproved));
        conditions.push(`is_approved = $${values.length}`);
      }
      if (isOriginal !== null) {
        values.push(Boolean(isOriginal));
        conditions.push(`is_original = $${values.length}`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const countRes = await pool.query(`SELECT COUNT(*) FROM media_assets ${whereClause}`, values);
      const total = parseInt(countRes.rows[0].count, 10);
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;

      const queryValues = [...values, limit, offset];
      const query = `
        SELECT * FROM media_assets
        ${whereClause}
        ORDER BY is_original DESC, created_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;
      const res = await pool.query(query, queryValues);
      const items = res.rows.map(r => ({
        id: r.id,
        src: r.src,
        filename: r.filename,
        categorySlug: r.category_slug,
        title: r.title,
        alt: r.alt,
        photographer: r.photographer,
        sourceName: r.source_name,
        sourceUrl: r.source_url,
        licenseType: r.license_type,
        licenseUrl: r.license_url,
        licenseVerifiedAt: r.license_verified_at,
        width: r.width,
        height: r.height,
        mimeType: r.mime_type,
        fileSize: r.file_size,
        isOriginal: r.is_original,
        isApproved: r.is_approved,
        createdAt: r.created_at
      }));

      return { items, pagination: { page, limit, total, totalPages } };
    }

    const db = getFileDbCache();
    let media = [...(db.mediaAssets || [])];

    if (category && category !== 'all') {
      media = media.filter(m => m.categorySlug === category);
    }
    if (search) {
      const q = search.toLowerCase();
      media = media.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.alt && m.alt.toLowerCase().includes(q)) ||
        (m.photographer && m.photographer.toLowerCase().includes(q)) ||
        (m.filename && m.filename.toLowerCase().includes(q))
      );
    }
    if (isApproved !== null) {
      const approvedBool = isApproved === 'true' || isApproved === true;
      media = media.filter(m => Boolean(m.isApproved) === approvedBool);
    }
    if (isOriginal !== null) {
      const originalBool = isOriginal === 'true' || isOriginal === true;
      media = media.filter(m => Boolean(m.isOriginal) === originalBool);
    }

    media.sort((a, b) => (b.isOriginal ? 1 : 0) - (a.isOriginal ? 1 : 0));
    const total = media.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const items = media.slice(offset, offset + limit);

    return { items, pagination: { page, limit, total, totalPages } };
  }

  async getMediaAssetById(id) {
    const db = getFileDbCache();
    const asset = (db.mediaAssets || []).find(m => m.id === id || m.filename === id);
    if (!asset) return null;

    // Calculate usage references
    const articles = (db.articles || [])
      .filter(a => a.coverImageId === asset.id || a.imageSrc === asset.src)
      .map(a => ({ id: a.id, slug: a.slug, title: a.title, categorySlug: a.categorySlug }));

    const categories = (db.categories || [])
      .filter(c => c.heroImageId === asset.id || c.heroImage === asset.src)
      .map(c => ({ id: c.id, slug: c.slug, name: c.name }));

    const gallery = (db.gallery || [])
      .filter(g => g.mediaAssetId === asset.id || g.src === asset.src)
      .map(g => ({ id: g.id, title: g.title, categorySlug: g.categorySlug }));

    return {
      ...asset,
      usage: {
        articles,
        categories,
        gallery,
        totalUsage: articles.length + categories.length + gallery.length
      }
    };
  }

  async createMediaAsset(data) {
    const asset = {
      id: data.id || `media-${Date.now()}`,
      src: data.src,
      filename: data.filename || path.basename(data.src),
      categorySlug: data.categorySlug || 'architecture',
      title: data.title || '',
      alt: data.alt || '',
      photographer: data.photographer || 'HBK Archive',
      sourceName: data.sourceName || 'Internal',
      sourceUrl: data.sourceUrl || data.src,
      licenseType: data.licenseType || 'Editorial Rights',
      licenseUrl: data.licenseUrl || '',
      licenseVerifiedAt: data.licenseVerifiedAt || new Date().toISOString(),
      width: Number(data.width) || 0,
      height: Number(data.height) || 0,
      mimeType: data.mimeType || 'image/jpeg',
      fileSize: Number(data.fileSize) || 0,
      isOriginal: Boolean(data.isOriginal),
      isApproved: data.isApproved !== false,
      createdAt: new Date().toISOString()
    };

    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO media_assets (id, src, filename, category_slug, title, alt, photographer, source_name, source_url, license_type, license_url, license_verified_at, width, height, mime_type, file_size, is_original, is_approved, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          asset.id, asset.src, asset.filename, asset.categorySlug, asset.title, asset.alt,
          asset.photographer, asset.sourceName, asset.sourceUrl, asset.licenseType, asset.licenseUrl,
          asset.licenseVerifiedAt, asset.width, asset.height, asset.mimeType, asset.fileSize,
          asset.isOriginal, asset.isApproved, asset.createdAt
        ]
      );
    }

    const db = getFileDbCache();
    if (!db.mediaAssets) db.mediaAssets = [];
    db.mediaAssets.unshift(asset);
    await saveFileDb();
    return asset;
  }

  async updateMediaAsset(id, updates) {
    const db = getFileDbCache();
    const asset = (db.mediaAssets || []).find(m => m.id === id);
    if (!asset) return null;

    if (asset.isOriginal && updates.isOriginal === false) {
      delete updates.isOriginal;
    }

    Object.assign(asset, updates);

    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        `UPDATE media_assets SET
          category_slug = COALESCE($1, category_slug),
          title = COALESCE($2, title),
          alt = COALESCE($3, alt),
          photographer = COALESCE($4, photographer),
          license_type = COALESCE($5, license_type),
          license_url = COALESCE($6, license_url),
          is_approved = COALESCE($7, is_approved)
         WHERE id = $8`,
        [
          updates.categorySlug, updates.title, updates.alt, updates.photographer,
          updates.licenseType, updates.licenseUrl, updates.isApproved, id
        ]
      );
    }

    await saveFileDb();
    return asset;
  }

  async deleteMediaAsset(id) {
    const db = getFileDbCache();
    const idx = (db.mediaAssets || []).findIndex(m => m.id === id);
    if (idx === -1) return { success: false, reason: 'NOT_FOUND' };

    const asset = db.mediaAssets[idx];
    if (asset.isOriginal) {
      return { success: false, reason: 'ORIGINAL_PROTECTED', message: 'Original baseline asset is permanent and protected.' };
    }

    db.mediaAssets.splice(idx, 1);

    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query('DELETE FROM media_assets WHERE id = $1', [id]);
    }

    await saveFileDb();
    return { success: true };
  }

  async detectDuplicateMedia({ filename, fileSize }) {
    const db = getFileDbCache();
    const match = (db.mediaAssets || []).find(m =>
      (fileSize && m.fileSize === Number(fileSize)) ||
      (filename && m.filename.toLowerCase() === filename.toLowerCase())
    );
    return match || null;
  }

  async rollbackEntityMedia(targetType, targetId) {
    const db = getFileDbCache();
    if (targetType === 'article') {
      const article = (db.articles || []).find(a => a.id === targetId || a.slug === targetId);
      if (!article) return null;
      article.imageSrc = '/images/hero.jpg';
      article.coverImageId = 'asset-hero';
      await saveFileDb();
      return article;
    } else if (targetType === 'category') {
      const cat = (db.categories || []).find(c => c.id === targetId || c.slug === targetId);
      if (!cat) return null;
      cat.heroImage = '/images/hero.jpg';
      cat.heroImageId = 'asset-hero';
      await saveFileDb();
      return cat;
    }
    return null;
  }

  async recommendMedia({ title = '', content = '', tags = '', categorySlug = '' }) {
    const db = getFileDbCache();
    const assets = (db.mediaAssets || []).filter(m => m.isApproved !== false);

    const queryTokens = `${title} ${tags} ${categorySlug} ${content.slice(0, 300)}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const scored = assets.map(asset => {
      let score = 0;
      const reasons = [];

      if (asset.categorySlug && asset.categorySlug.toLowerCase() === categorySlug.toLowerCase()) {
        score += 30;
        reasons.push(`Category match (${asset.categorySlug})`);
      }

      const targetText = `${asset.title || ''} ${asset.alt || ''} ${asset.filename || ''} ${asset.categorySlug || ''}`.toLowerCase();
      const matchedWords = [];

      queryTokens.forEach(token => {
        if (targetText.includes(token)) {
          score += 10;
          if (!matchedWords.includes(token)) matchedWords.push(token);
        }
      });

      if (matchedWords.length > 0) {
        reasons.push(`Matched keywords: ${matchedWords.slice(0, 4).join(', ')}`);
      }

      return {
        asset,
        score,
        matchReason: reasons.join('; ') || 'General thematic candidate'
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 6);
  }
}

export const contentRepository = new ContentRepository();
