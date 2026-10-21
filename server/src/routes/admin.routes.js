import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Public auth routes
router.post('/login', (req, res, next) => adminController.login(req, res, next));
router.post('/logout', (req, res, next) => adminController.logout(req, res, next));

// Protected admin routes
router.get('/me', requireAdmin, (req, res) => adminController.getMe(req, res));
router.get('/stats', requireAdmin, (req, res, next) =>
  adminController.getAdminStats ? adminController.getAdminStats(req, res, next) : adminController.getStats(req, res, next)
);

// Articles
router.post('/articles', requireAdmin, (req, res, next) => adminController.createArticle(req, res, next));
router.patch('/articles/:id', requireAdmin, (req, res, next) => adminController.updateArticle(req, res, next));
router.delete('/articles/:id', requireAdmin, (req, res, next) => adminController.deleteArticle(req, res, next));

// Media Management
router.get('/media', requireAdmin, (req, res, next) => adminController.getAllMedia(req, res, next));
router.get('/media/recommend', requireAdmin, (req, res, next) => adminController.recommendMedia(req, res, next));
router.post('/media/detect-duplicate', requireAdmin, (req, res, next) => adminController.detectDuplicate(req, res, next));
router.post('/media/rollback', requireAdmin, (req, res, next) => adminController.rollbackMedia(req, res, next));
router.get('/media/:id', requireAdmin, (req, res, next) => adminController.getMediaById(req, res, next));
router.post('/media', requireAdmin, upload.single('file'), (req, res, next) => adminController.uploadMedia(req, res, next));
router.post('/media/upload', requireAdmin, upload.single('file'), (req, res, next) => adminController.uploadMedia(req, res, next));
router.put('/media/:id', requireAdmin, (req, res, next) => adminController.updateMedia(req, res, next));
router.delete('/media/:id', requireAdmin, (req, res, next) => adminController.deleteMedia(req, res, next));

// Audit Logs
router.get('/audit-logs', requireAdmin, (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
