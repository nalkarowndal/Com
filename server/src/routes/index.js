import { Router } from 'express';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount public routes at /api
router.use('/', publicRoutes);

// Mount admin routes at /api/admin
router.use('/admin', adminRoutes);

export default router;
