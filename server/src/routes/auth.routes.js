import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Session & Profile endpoints
router.get('/session', authenticateToken, (req, res, next) => authController.getSession(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', requireAuth, (req, res, next) => authController.updateProfile(req, res, next));
router.put('/password', requireAuth, (req, res, next) => authController.changePassword(req, res, next));

export default router;

