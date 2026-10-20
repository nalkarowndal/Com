import crypto from 'crypto';
import { env } from '../config/env.js';

export class AuthService {
  generateToken(user) {
    const payload = {
      username: user.username,
      role: user.role || 'admin',
      iat: Date.now()
    };
    const dataStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(dataStr)
      .digest('base64url');
    return `${dataStr}.${signature}`;
  }

  verifyToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [dataStr, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(dataStr)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    try {
      const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf-8'));
      // Check expiration (e.g., 24 hours)
      if (Date.now() - payload.iat > 24 * 60 * 60 * 1000) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  authenticate(username, password) {
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      const user = { username: env.ADMIN_USERNAME, role: 'admin' };
      const token = this.generateToken(user);
      return { user, token };
    }
    return null;
  }
}

export const authService = new AuthService();
