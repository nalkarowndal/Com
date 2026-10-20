import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.resolve(__dirname, '../../db/seeds/001_initial_content.json');
const PERSISTENT_DB_FILE = path.resolve(__dirname, '../../db/persistent_data.json');

let pgPool = null;
let activeEngine = 'uninitialized';
let dbStatus = {
  engine: 'uninitialized',
  connected: false,
  message: 'Database not initialized'
};

// In-memory / file-backed persistent cache for fallback engine
let fileDbCache = null;

async function loadSeedData() {
  const raw = await fs.readFile(SEED_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function initFileDb() {
  try {
    const raw = await fs.readFile(PERSISTENT_DB_FILE, 'utf-8');
    fileDbCache = JSON.parse(raw);
    console.info('[Storage] Loaded existing file-backed persistent database.');
  } catch {
    console.info('[Storage] Initializing new file-backed persistent database from seed...');
    fileDbCache = await loadSeedData();
    fileDbCache.auditLogs = [];
    await fs.writeFile(PERSISTENT_DB_FILE, JSON.stringify(fileDbCache, null, 2), 'utf-8');
  }
}

export async function saveFileDb() {
  if (fileDbCache) {
    await fs.writeFile(PERSISTENT_DB_FILE, JSON.stringify(fileDbCache, null, 2), 'utf-8');
  }
}

export async function initDatabase() {
  // Always prepare persistent fallback database first
  await initFileDb();

  if (env.DATABASE_URL) {
    try {
      console.info(`[Storage] Attempting PostgreSQL connection to: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
      pgPool = new pg.Pool({
        connectionString: env.DATABASE_URL,
        connectionTimeoutMillis: 2000
      });

      // Test connection
      const client = await pgPool.connect();
      try {
        await client.query('SELECT 1');
        console.info('[Storage] PostgreSQL connection established successfully.');

        // Run migrations
        const migrationPath = path.resolve(__dirname, '../../db/migrations/001_create_tables.sql');
        const migrationSql = await fs.readFile(migrationPath, 'utf-8');
        await client.query(migrationSql);
        console.info('[Storage] PostgreSQL migrations executed successfully.');

        activeEngine = 'postgres';
        dbStatus = {
          engine: 'postgres',
          connected: true,
          message: 'PostgreSQL database connected and operational'
        };
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[Storage] PostgreSQL connection attempt failed:', err.message);
      console.warn('[Storage] Engaging resilient file-backed persistent storage layer as fallback.');
      if (pgPool) {
        try {
          await pgPool.end();
        } catch {
          // ignore
        }
        pgPool = null;
      }
      activeEngine = 'file_persistence';
      dbStatus = {
        engine: 'file_persistence',
        connected: true,
        postgresNotice: `PostgreSQL connection failed (${err.code || err.message}). Fallback persistent storage active.`,
        message: 'Resilient persistent file storage operational'
      };
    }
  } else {
    console.info('[Storage] No DATABASE_URL configured. Using resilient file-backed persistent storage.');
    activeEngine = 'file_persistence';
    dbStatus = {
      engine: 'file_persistence',
      connected: true,
      message: 'Resilient persistent file storage operational'
    };
  }
}

export function getDbStatus() {
  return { ...dbStatus, activeEngine };
}

export function getFileDbCache() {
  return fileDbCache;
}

export function getPgPool() {
  return pgPool;
}
