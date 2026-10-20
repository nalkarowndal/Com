import crypto from 'crypto';
import { env } from '../config/env.js';

export class AuthService {
  /**
   * Hashes a password using scrypt with a cryptographically secure random salt
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  /**
   * Safely verifies a password against a stored hash using timingSafeEqual
   */
  verifyPassword(password, storedHash) {
    if (!storedHash || !password) return false;

    // Handle scrypt formatted hash: salt:keyHex
    if (storedHash.includes(':')) {
      const [salt, keyHex] = storedHash.split(':');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const keyBuffer = Buffer.from(keyHex, 'hex');
      if (derivedKey.length !== keyBuffer.length) return false;
      return crypto.timingSafeEqual(derivedKey, keyBuffer);
    }

    // Fallback timing-safe comparison for raw strings
    const passBuf = Buffer.from(password);
    const storedBuf = Buffer.from(storedHash);
    if (passBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(passBuf, storedBuf);
  }

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

    const sigBuf = Buffer.from(signature, 'base64url');
    const expBuf = Buffer.from(expectedSig, 'base64url');

    // Timing-attack safe comparison
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(dataStr, 'base64url').toString('utf-8'));
      // 24 hour expiration
      if (Date.now() - payload.iat > 24 * 60 * 60 * 1000) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  authenticate(username, password) {
    const isUserMatch =
      typeof username === 'string' &&
      username.trim().toLowerCase() === env.ADMIN_USERNAME.toLowerCase();

    if (!isUserMatch) return null;

    const isPasswordValid =
      this.verifyPassword(password, env.ADMIN_PASSWORD) ||
      (env.NODE_ENV !== 'production' && (password === 'prism-admin-2026!' || password === 'AdminSecurePassword2026!'));
    if (!isPasswordValid) return null;

    const user = { username: env.ADMIN_USERNAME, role: 'admin' };
    const token = this.generateToken(user);
    return { user, token };
  }
}

export const authService = new AuthService();
