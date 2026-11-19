import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const frontendOrigin = (
  process.env.FRONTEND_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:5173'
).trim().replace(/\/+$/, '');

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: (process.env.CLIENT_ORIGIN || frontendOrigin).trim().replace(/\/+$/, ''),
  FRONTEND_ORIGIN: frontendOrigin,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_company_prism_2026',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev_session_secret_company_prism_2026',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminSecurePassword2026!',
  GOOGLE_CLIENT_ID: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  GOOGLE_CLIENT_SECRET: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
  KAKAO_REST_API_KEY: (process.env.KAKAO_REST_API_KEY || '').trim(),
  KAKAO_CLIENT_SECRET: (process.env.KAKAO_CLIENT_SECRET || '').trim(),
  KAKAO_REDIRECT_URI: (process.env.KAKAO_REDIRECT_URI || `${frontendOrigin}/oauth/callback/kakao`).trim()
};
