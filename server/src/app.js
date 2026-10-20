import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { configureSecurity } from './middleware/security.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Basic request parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // Structured Logging
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

  // Security headers, CORS, and rate limiting
  configureSecurity(app);

  // Serve static files from root public directory as fallback
  const publicDir = path.resolve(__dirname, '../../public');
  app.use(express.static(publicDir));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Catch-all 404 & Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
