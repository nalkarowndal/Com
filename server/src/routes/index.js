import { Router } from 'express';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount authentication routes at /api/auth
router.use('/auth', authRoutes);

// Mount public routes at /api
router.use('/', publicRoutes);

// Mount admin routes at /api/admin
router.use('/admin', adminRoutes);

export default router;
