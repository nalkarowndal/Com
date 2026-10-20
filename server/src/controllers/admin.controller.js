import { authService } from '../services/auth.service.js';
import { contentService } from '../services/content.service.js';

export class AdminController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Username and password are required'
          }
        });
      }

      const authResult = authService.authenticate(username, password);
      if (!authResult) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid administrative username or password'
          }
        });
      }

      // Set HttpOnly cookie
      res.cookie('admin_token', authResult.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          user: authResult.user,
          token: authResult.token
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    res.clearCookie('admin_token');
    res.json({
      success: true,
      data: { message: 'Successfully logged out' }
    });
  }

  async updateArticle(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await contentService.updateArticle(id, updates, req.user?.username || 'admin');

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ARTICLE_NOT_FOUND',
            message: `Article with ID '${id}' not found`
          }
        });
      }

      res.json({
        success: true,
        data: updated,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await contentService.getAuditLogs();
      res.json({
        success: true,
        data: logs,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadMedia(req, res, next) {
    try {
      const { name, src, alt } = req.body;
      if (!src) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Media src is required' }
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: `media-${Date.now()}`,
          name: name || 'Uploaded Media',
          src,
          alt: alt || ''
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
