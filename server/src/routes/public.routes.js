import { Router } from 'express';
import { publicController } from '../controllers/public.controller.js';

const router = Router();

router.get('/health', (req, res, next) => publicController.getHealth(req, res, next));
router.get('/site', (req, res, next) => publicController.getSite(req, res, next));
router.get('/home', (req, res, next) => publicController.getHome(req, res, next));

router.get('/categories', (req, res, next) => publicController.getCategories(req, res, next));
router.get('/categories/:slug', (req, res, next) => publicController.getCategoryBySlug(req, res, next));

router.get('/articles', (req, res, next) => publicController.getArticles(req, res, next));
router.get('/articles/:slug', (req, res, next) => publicController.getArticleBySlug(req, res, next));

router.get('/gallery', (req, res, next) => publicController.getGallery(req, res, next));
router.get('/media', (req, res, next) => publicController.getMedia(req, res, next));
router.get('/search', (req, res, next) => publicController.search(req, res, next));

export default router;
