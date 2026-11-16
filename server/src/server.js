import { createApp } from './app.js';
import { initDatabase, getDbStatus } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    console.info('=== Starting HBK Company API Server ===');
    console.info(`Node Runtime: ${process.version}`);
    console.info(`Environment: ${env.NODE_ENV}`);

    // Initialize database (PostgreSQL with resilient file fallback)
    await initDatabase();
    const dbStatus = getDbStatus();
    console.info(`Storage Engine Status: [${dbStatus.engine}] - Connected: ${dbStatus.connected}`);

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.info(`HBK API Server listening on http://localhost:${env.PORT}`);
      console.info(`Health check available at http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = () => {
      console.info('Gracefully shutting down HBK API server...');
      server.close(() => {
        console.info('Server closed. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal server bootstrap failure:', err);
    process.exit(1);
  }
}

bootstrap();
