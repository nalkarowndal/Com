import { contentService } from '../services/content.service.js';
import { getDbStatus } from '../config/database.js';

export class PublicController {
  async getHealth(req, res, next) {
    try {
      const dbStatus = getDbStatus();
      res.json({
        success: true,
        data: {
          status: 'healthy',
          uptimeSeconds: Math.floor(process.uptime()),
          storage: dbStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getSite(req, res, next) {
    try {
      const site = await contentService.getSiteInfo();
      res.json({
        success: true,
        data: site,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getHome(req, res, next) {
    try {
      const homeData = await contentService.getHomePayload();
      res.json({
        success: true,
        data: homeData,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await contentService.getCategories();
      res.json({
        success: true,
        data: categories,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await contentService.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: { code: 'CATEGORY_NOT_FOUND', message: `Category '${slug}' not found` }
        });
      }

      // Also fetch related articles for this category
      const articles = await contentService.getArticles({ category: slug, limit: 12 });

      res.json({
        success: true,
        data: {
          category,
          articles: articles.items || articles
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getArticles(req, res, next) {
    try {
      const { category, q, tag, page = 1, limit = 12, sort = 'latest' } = req.query;
      const result = await contentService.getArticles({
        category,
        q,
        tag,
        page: parseInt(page, 10) || 1,
        limit: Math.min(50, parseInt(limit, 10) || 12),
        sort
      });

      res.json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getArticleBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const article = await contentService.getArticleBySlug(slug);
      if (!article) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ARTICLE_NOT_FOUND',
            message: `Article with slug '${slug}' was not found`
          }
        });
      }

      // Fetch 2-3 related articles in the same category
      const related = await contentService.getArticles({
        category: article.categorySlug,
        limit: 4
      });

      const relatedItems = (related.items || related).filter((a) => a.id !== article.id).slice(0, 3);

      res.json({
        success: true,
        data: {
          ...article,
          related: relatedItems
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getGallery(req, res, next) {
    try {
      const { category } = req.query;
      const gallery = await contentService.getGallery({ category });
      res.json({
        success: true,
        data: gallery,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const { q = '', category, page = 1, limit = 12, sort } = req.query;
      const result = await contentService.search({
        q,
        category,
        page: parseInt(page, 10) || 1,
        limit: Math.min(50, parseInt(limit, 10) || 12),
        sort
      });

      res.json({
        success: true,
        data: {
          query: q,
          results: result.items,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMedia(req, res, next) {
    try {
      const { category, search, page = 1, limit = 50 } = req.query;
      const result = await contentService.getMediaAssets({
        category,
        search,
        isApproved: true,
        page: parseInt(page, 10) || 1,
        limit: Math.min(100, parseInt(limit, 10) || 50)
      });
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const publicController = new PublicController();
