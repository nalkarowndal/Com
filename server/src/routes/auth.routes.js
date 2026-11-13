import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth endpoints
router.get('/config', (req, res) => authController.getConfig(req, res));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

// Federated Social OAuth Endpoints (Google & Kakao)
router.post('/google', (req, res, next) => authController.googleLogin(req, res, next));
router.post('/kakao', (req, res, next) => authController.kakaoLogin(req, res, next));
router.get('/kakao/authorize', (req, res) => authController.kakaoAuthorize(req, res));
router.get('/kakao/callback', (req, res, next) => authController.kakaoCallback(req, res, next));

// Session & Profile endpoints
router.get('/session', authenticateToken, (req, res, next) => authController.getSession(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', requireAuth, (req, res, next) => authController.updateProfile(req, res, next));
router.put('/password', requireAuth, (req, res, next) => authController.changePassword(req, res, next));

export default router;

