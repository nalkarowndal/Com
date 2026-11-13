import crypto from 'crypto';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';

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
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.displayName || user.username,
      role: user.role || 'user',
      avatar: user.avatar || '/images/avatars/user.svg',
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

  async authenticate(identifier, password) {
    if (!identifier || !password) return null;

    // 1. Look up user by username or email
    const user = await userRepository.findByUsernameOrEmail(identifier);
    if (user) {
      if (user.status && user.status !== 'active') {
        const err = new Error('Your account has been deactivated. Please contact support.');
        err.code = 'ACCOUNT_DEACTIVATED';
        err.status = 403;
        throw err;
      }

      let isPasswordValid = this.verifyPassword(password, user.passwordHash);

      // Support fallback passwords in non-production for admin user
      if (!isPasswordValid && env.NODE_ENV !== 'production' && user.role === 'admin') {
        isPasswordValid =
          password === env.ADMIN_PASSWORD ||
          password === 'prism-admin-2026!' ||
          password === 'AdminSecurePassword2026!';
      }

      if (isPasswordValid) {
        await userRepository.updateLastLogin(user.id);
        const sanitized = userRepository.sanitizeUser(user);
        const token = this.generateToken(sanitized);
        return { user: sanitized, token };
      }
      return null;
    }

    // 2. Fallback check for initial admin username matching env configuration
    const isEnvAdminUser =
      typeof identifier === 'string' &&
      identifier.trim().toLowerCase() === env.ADMIN_USERNAME.toLowerCase();

    if (isEnvAdminUser) {
      const isPasswordValid =
        this.verifyPassword(password, env.ADMIN_PASSWORD) ||
        (env.NODE_ENV !== 'production' &&
          (password === 'prism-admin-2026!' || password === 'AdminSecurePassword2026!'));

      if (isPasswordValid) {
        // Upsert admin user into database for future consistency
        const newAdmin = await userRepository.createUser({
          id: 'usr-admin-001',
          username: env.ADMIN_USERNAME,
          email: 'admin@prism.company.io',
          passwordHash: this.hashPassword(env.ADMIN_PASSWORD),
          name: 'Chief Editorial Curator',
          role: 'admin',
          status: 'active',
          avatar: '/images/avatars/admin.svg'
        });
        const sanitized = userRepository.sanitizeUser(newAdmin);
        const token = this.generateToken(sanitized);
        return { user: sanitized, token };
      }
    }

    return null;
  }

  async register({ username, email, password, name }) {
    // 1. Username validation
    if (!username || typeof username !== 'string') {
      const err = new Error('Username is required');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }
    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(cleanUsername)) {
      const err = new Error('Username must be 3-30 characters containing letters, numbers, hyphens or underscores');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    // 2. Email validation
    if (!email || typeof email !== 'string') {
      const err = new Error('Email is required');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      const err = new Error('Please enter a valid email address');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    // 3. Password validation
    if (!password || typeof password !== 'string') {
      const err = new Error('Password is required');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }
    if (password.length < 8) {
      const err = new Error('Password must be at least 8 characters long');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      const err = new Error('Password must contain at least one letter and one number');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    // 4. Uniqueness checks
    const existingUser = await userRepository.findByUsername(cleanUsername);
    if (existingUser) {
      const err = new Error('Username is already taken');
      err.code = 'DUPLICATE_USERNAME';
      err.status = 409;
      throw err;
    }

    const existingEmail = await userRepository.findByEmail(cleanEmail);
    if (existingEmail) {
      const err = new Error('Email is already registered');
      err.code = 'DUPLICATE_EMAIL';
      err.status = 409;
      throw err;
    }

    // 5. Create user (Enforcing role: 'user' strictly!)
    const passwordHash = this.hashPassword(password);
    const displayName = (name && typeof name === 'string' && name.trim()) || cleanUsername;

    const user = await userRepository.createUser({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      name: displayName,
      role: 'user', // STRICT: Public register can NEVER create admin
      status: 'active',
      avatar: '/images/avatars/user.svg'
    });

    const sanitized = userRepository.sanitizeUser(user);
    const token = this.generateToken(sanitized);
    return { user: sanitized, token };
  }

  async updateProfile(userId, { name, email, avatar }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;

    if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        const err = new Error('Invalid email format');
        err.code = 'VALIDATION_ERROR';
        err.status = 400;
        throw err;
      }
      const existing = await userRepository.findByEmail(cleanEmail);
      if (existing && existing.id !== userId) {
        const err = new Error('Email is already in use by another account');
        err.code = 'DUPLICATE_EMAIL';
        err.status = 409;
        throw err;
      }
      updates.email = cleanEmail;
    }

    const updated = await userRepository.updateUser(userId, updates);
    const sanitized = userRepository.sanitizeUser(updated);
    const token = this.generateToken(sanitized);
    return { user: sanitized, token };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      err.status = 404;
      throw err;
    }

    const isCurrentValid = this.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      const err = new Error('Current password does not match');
      err.code = 'INVALID_PASSWORD';
      err.status = 400;
      throw err;
    }

    if (!newPassword || newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      const err = new Error('New password must be at least 8 characters with letters and numbers');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      throw err;
    }

    const newHash = this.hashPassword(newPassword);
    await userRepository.updatePassword(userId, newHash);
    return true;
  }
}

export const authService = new AuthService();
