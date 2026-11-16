import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';
import { authService } from '../services/auth.service.js';
import { contentService } from '../services/content.service.js';
import { userRepository } from '../repositories/user.repository.js';

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

      const authResult = await authService.authenticate(username, password);
      if (!authResult) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid administrative username or password'
          }
        });
      }

      if (authResult.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Administrative privileges required'
          }
        });
      }

      const cookieOpts = {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      };

      res.cookie('admin_token', authResult.token, cookieOpts);
      res.cookie('prism_auth_token', authResult.token, cookieOpts);
      res.cookie('auth_token', authResult.token, cookieOpts);

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
    res.clearCookie('prism_auth_token');
    res.clearCookie('auth_token');
    res.json({
      success: true,
      data: { message: 'Successfully logged out' }
    });
  }

  async getMe(req, res) {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  }

  async getStats(req, res, next) {
    try {
      const stats = await contentService.getAdminStats();
      res.json({
        success: true,
        data: stats,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async createArticle(req, res, next) {
    try {
      const data = req.body;
      if (!data.title) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Article title is required' }
        });
      }

      const created = await contentService.createArticle(data, req.user?.username || 'admin');
      res.status(201).json({
        success: true,
        data: created,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
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

  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;
      const success = await contentService.deleteArticle(id, req.user?.username || 'admin');
      if (!success) {
        return res.status(404).json({
          success: false,
          error: { code: 'ARTICLE_NOT_FOUND', message: `Article with ID '${id}' not found` }
        });
      }
      res.json({
        success: true,
        data: { id, deleted: true }
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

  async getAllMedia(req, res, next) {
    try {
      const { category, search, isApproved, isOriginal, page, limit } = req.query;
      const result = await contentService.getMediaAssets({
        category,
        search,
        isApproved,
        isOriginal,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50
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

  async getMediaById(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await contentService.getMediaAssetById(id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          error: { code: 'MEDIA_NOT_FOUND', message: `Media asset '${id}' not found` }
        });
      }

      res.json({
        success: true,
        data: asset,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadMedia(req, res, next) {
    try {
      let src = req.body?.src;
      let filename = req.body?.filename;
      let fileSize = Number(req.body?.fileSize) || 0;
      let mimeType = req.body?.mimeType || 'image/jpeg';
      let width = Number(req.body?.width) || 0;
      let height = Number(req.body?.height) || 0;

      // Handle file upload from Multer if present
      if (req.file) {
        src = `/images/uploads/${req.file.filename}`;
        filename = req.file.filename;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;

        try {
          const buf = fs.readFileSync(req.file.path);
          const dim = imageSize(buf);
          width = dim.width || 0;
          height = dim.height || 0;
        } catch {
          // fallback if image dimension parsing fails
        }
      }

      if (!src) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Image file or source URL is required' }
        });
      }

      // Check for duplicate if not forced
      if (req.body?.ignoreDuplicate !== 'true' && req.body?.ignoreDuplicate !== true) {
        const existing = await contentService.detectDuplicateMedia({ filename, fileSize });
        if (existing) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_MEDIA_DETECTED',
              message: `Duplicate image detected matching existing asset '${existing.title || existing.filename}'`,
              existingAsset: existing
            }
          });
        }
      }

      const mediaData = {
        src,
        filename: filename || path.basename(src),
        categorySlug: req.body?.categorySlug || 'architecture',
        title: req.body?.title || req.body?.name || path.basename(src),
        alt: req.body?.alt || req.body?.title || '',
        photographer: req.body?.photographer || 'HBK Contributor',
        sourceName: req.body?.sourceName || (req.file ? 'Staff Upload' : 'External Library'),
        sourceUrl: req.body?.sourceUrl || src,
        licenseType: req.body?.licenseType || 'Editorial Rights',
        licenseUrl: req.body?.licenseUrl || '',
        licenseVerifiedAt: req.body?.licenseVerifiedAt || new Date().toISOString(),
        width,
        height,
        mimeType,
        fileSize,
        isOriginal: false,
        isApproved: req.body?.isApproved !== 'false' && req.body?.isApproved !== false
      };

      const created = await contentService.createMediaAsset(mediaData, req.user?.username || 'admin');

      res.status(201).json({
        success: true,
        data: created,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMedia(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updated = await contentService.updateMediaAsset(id, updates, req.user?.username || 'admin');

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'MEDIA_NOT_FOUND', message: `Media asset with ID '${id}' not found` }
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

  async deleteMedia(req, res, next) {
    try {
      const { id } = req.params;
      const result = await contentService.deleteMediaAsset(id, req.user?.username || 'admin');

      if (!result.success) {
        if (result.reason === 'ORIGINAL_PROTECTED') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ORIGINAL_ASSET_PROTECTED',
              message: result.message
            }
          });
        }
        return res.status(404).json({
          success: false,
          error: { code: 'MEDIA_NOT_FOUND', message: `Media asset '${id}' not found` }
        });
      }

      res.json({
        success: true,
        data: { id, deleted: true },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async detectDuplicate(req, res, next) {
    try {
      const { filename, fileSize } = req.body;
      const match = await contentService.detectDuplicateMedia({ filename, fileSize });
      res.json({
        success: true,
        isDuplicate: Boolean(match),
        match: match || null
      });
    } catch (err) {
      next(err);
    }
  }

  async rollbackMedia(req, res, next) {
    try {
      const { targetType, targetId } = req.body; // targetType: 'article' | 'category'
      if (!targetType || !targetId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'targetType and targetId are required' }
        });
      }

      const rolledBack = await contentService.rollbackEntityMedia(targetType, targetId, req.user?.username || 'admin');
      if (!rolledBack) {
        return res.status(404).json({
          success: false,
          error: { code: 'ENTITY_NOT_FOUND', message: `${targetType} '${targetId}' not found for rollback` }
        });
      }

      res.json({
        success: true,
        data: rolledBack,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async recommendMedia(req, res, next) {
    try {
      const { title, content, tags, categorySlug } = req.query;
      const recommendations = await contentService.recommendMedia({
        title,
        content,
        tags,
        categorySlug
      });

      res.json({
        success: true,
        data: recommendations,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 50, search = '', role = '' } = req.query;
      const result = await userRepository.listUsers({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
        search,
        role
      });
      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, role } = req.body;
      const updates = {};
      if (status) updates.status = status;
      if (role) updates.role = role;

      const updated = await userRepository.updateUser(id, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: userRepository.sanitizeUser(updated)
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      if (id === 'usr-admin-001' || req.user.id === id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Cannot delete primary admin or currently active user' }
        });
      }

      const deleted = await userRepository.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' }
        });
      }

      res.json({
        success: true,
        data: { message: 'User successfully removed' }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
