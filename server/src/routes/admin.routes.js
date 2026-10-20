import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth routes
router.post('/login', (req, res, next) => adminController.login(req, res, next));
router.post('/logout', (req, res, next) => adminController.logout(req, res, next));

// Protected admin routes
router.patch('/articles/:id', requireAdmin, (req, res, next) => adminController.updateArticle(req, res, next));
router.post('/media', requireAdmin, (req, res, next) => adminController.uploadMedia(req, res, next));
router.get('/audit-logs', requireAdmin, (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
