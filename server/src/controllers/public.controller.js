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

  async getArticles(req, res, next) {
    try {
      const articles = await contentService.getArticles();
      res.json({
        success: true,
        data: articles,
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
      res.json({
        success: true,
        data: article,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getGallery(req, res, next) {
    try {
      const gallery = await contentService.getGallery();
      res.json({
        success: true,
        data: gallery,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const publicController = new PublicController();
