import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth routes
router.post('/login', (req, res, next) => adminController.login(req, res, next));
router.post('/logout', (req, res, next) => adminController.logout(req, res, next));

// Protected admin routes
router.get('/me', requireAdmin, (req, res) => adminController.getMe(req, res));
router.get('/stats', requireAdmin, (req, res, next) => adminController.getAdminStats ? adminController.getAdminStats(req, res, next) : adminController.getStats(req, res, next));

router.post('/articles', requireAdmin, (req, res, next) => adminController.createArticle(req, res, next));
router.patch('/articles/:id', requireAdmin, (req, res, next) => adminController.updateArticle(req, res, next));
router.delete('/articles/:id', requireAdmin, (req, res, next) => adminController.deleteArticle(req, res, next));

router.post('/media', requireAdmin, (req, res, next) => adminController.uploadMedia(req, res, next));
router.get('/audit-logs', requireAdmin, (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
