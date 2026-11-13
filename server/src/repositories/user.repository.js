import { getFileDbCache, saveFileDb, getPgPool, getDbStatus } from '../config/database.js';

export class UserRepository {
  sanitizeUser(user) {
    if (!user) return null;
    const sanitized = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.displayName || user.username,
      role: user.role || 'user',
      status: user.status || 'active',
      avatar: user.avatar || '/images/avatars/user.svg',
      bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks : [],
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || user.last_login_at || null
    };
    return sanitized;
  }

  async findByUsername(username) {
    if (!username) return null;
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
        [username.trim()]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        username: r.username,
        email: r.email,
        passwordHash: r.password_hash,
        name: r.name,
        role: r.role,
        status: r.status,
        avatar: r.avatar,
        bookmarks: typeof r.bookmarks === 'string' ? JSON.parse(r.bookmarks) : (r.bookmarks || []),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastLoginAt: r.last_login_at
      };
    }

    const db = getFileDbCache();
    const users = db.users || [];
    const target = username.trim().toLowerCase();
    const found = users.find((u) => u.username && u.username.toLowerCase() === target);
    return found ? { ...found } : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
        [email.trim()]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        username: r.username,
        email: r.email,
        passwordHash: r.password_hash,
        name: r.name,
        role: r.role,
        status: r.status,
        avatar: r.avatar,
        bookmarks: typeof r.bookmarks === 'string' ? JSON.parse(r.bookmarks) : (r.bookmarks || []),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastLoginAt: r.last_login_at
      };
    }

    const db = getFileDbCache();
    const users = db.users || [];
    const target = email.trim().toLowerCase();
    const found = users.find((u) => u.email && u.email.toLowerCase() === target);
    return found ? { ...found } : null;
  }

  async findByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const byUser = await this.findByUsername(identifier);
    if (byUser) return byUser;
    return await this.findByEmail(identifier);
  }

  async findById(id) {
    if (!id) return null;
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        username: r.username,
        email: r.email,
        passwordHash: r.password_hash,
        name: r.name,
        role: r.role,
        status: r.status,
        avatar: r.avatar,
        bookmarks: typeof r.bookmarks === 'string' ? JSON.parse(r.bookmarks) : (r.bookmarks || []),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        lastLoginAt: r.last_login_at
      };
    }

    const db = getFileDbCache();
    const users = db.users || [];
    const found = users.find((u) => u.id === id);
    return found ? { ...found } : null;
  }

  async createUser(userData) {
    const status = getDbStatus();
    const now = new Date().toISOString();
    const user = {
      id: userData.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: userData.username.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      name: userData.name ? userData.name.trim() : userData.username.trim(),
      role: userData.role || 'user',
      status: userData.status || 'active',
      avatar: userData.avatar || '/images/avatars/user.svg',
      bookmarks: userData.bookmarks || [],
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    };

    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, name, role, status, avatar, bookmarks, created_at, updated_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          user.id,
          user.username,
          user.email,
          user.passwordHash,
          user.name,
          user.role,
          user.status,
          user.avatar,
          JSON.stringify(user.bookmarks),
          user.createdAt,
          user.updatedAt,
          user.lastLoginAt
        ]
      );
      return user;
    }

    const db = getFileDbCache();
    if (!db.users) db.users = [];
    db.users.push(user);
    await saveFileDb();
    return user;
  }

  async updateUser(id, updates) {
    const status = getDbStatus();
    const now = new Date().toISOString();

    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const current = await this.findById(id);
      if (!current) return null;

      const newName = updates.name !== undefined ? updates.name : current.name;
      const newEmail = updates.email !== undefined ? updates.email.toLowerCase().trim() : current.email;
      const newAvatar = updates.avatar !== undefined ? updates.avatar : current.avatar;
      const newStatus = updates.status !== undefined ? updates.status : current.status;
      const newBookmarks = updates.bookmarks !== undefined ? updates.bookmarks : current.bookmarks;

      await pool.query(
        `UPDATE users
         SET name = $1, email = $2, avatar = $3, status = $4, bookmarks = $5, updated_at = $6
         WHERE id = $7`,
        [newName, newEmail, newAvatar, newStatus, JSON.stringify(newBookmarks), now, id]
      );
      return await this.findById(id);
    }

    const db = getFileDbCache();
    if (!db.users) db.users = [];
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...updates,
      updatedAt: now
    };
    await saveFileDb();
    return { ...db.users[index] };
  }

  async updatePassword(id, newPasswordHash) {
    const status = getDbStatus();
    const now = new Date().toISOString();

    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3',
        [newPasswordHash, now, id]
      );
      return true;
    }

    const db = getFileDbCache();
    if (!db.users) db.users = [];
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    db.users[index].passwordHash = newPasswordHash;
    db.users[index].updatedAt = now;
    await saveFileDb();
    return true;
  }

  async updateLastLogin(id) {
    const status = getDbStatus();
    const now = new Date().toISOString();

    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, id]);
      return;
    }

    const db = getFileDbCache();
    if (!db.users) db.users = [];
    const index = db.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      db.users[index].lastLoginAt = now;
      await saveFileDb();
    }
  }

  async listUsers({ page = 1, limit = 50, search = '', role = '' } = {}) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (search) {
        query += ` AND (LOWER(username) LIKE $${paramIdx} OR LOWER(email) LIKE $${paramIdx} OR LOWER(name) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      if (role && role !== 'all') {
        query += ` AND role = $${paramIdx}`;
        params.push(role);
        paramIdx++;
      }

      const countRes = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
      const total = parseInt(countRes.rows[0].count, 10);

      query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(limit, (page - 1) * limit);

      const res = await pool.query(query, params);
      return {
        users: res.rows.map((r) => this.sanitizeUser({
          id: r.id,
          username: r.username,
          email: r.email,
          name: r.name,
          role: r.role,
          status: r.status,
          avatar: r.avatar,
          bookmarks: typeof r.bookmarks === 'string' ? JSON.parse(r.bookmarks) : r.bookmarks,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          lastLoginAt: r.last_login_at
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1
      };
    }

    const db = getFileDbCache();
    let users = (db.users || []).map((u) => this.sanitizeUser(u));

    if (search) {
      const term = search.toLowerCase();
      users = users.filter((u) =>
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.name && u.name.toLowerCase().includes(term))
      );
    }

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit);

    return {
      users: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  async deleteUser(id) {
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    }

    const db = getFileDbCache();
    if (!db.users) return false;
    const initialLen = db.users.length;
    db.users = db.users.filter((u) => u.id !== id);
    if (db.users.length !== initialLen) {
      await saveFileDb();
      return true;
    }
    return false;
  }

  async findSocialIdentity(provider, providerUserId) {
    if (!provider || !providerUserId) return null;
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM social_identities WHERE provider = $1 AND provider_user_id = $2 LIMIT 1',
        [provider, String(providerUserId)]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        provider: r.provider,
        providerUserId: r.provider_user_id,
        email: r.email,
        profileData: r.profile_data,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };
    }

    const db = getFileDbCache();
    const list = db.socialIdentities || [];
    const found = list.find((s) => s.provider === provider && s.providerUserId === String(providerUserId));
    return found ? { ...found } : null;
  }

  async createSocialIdentity({ userId, provider, providerUserId, email, profileData = {} }) {
    const status = getDbStatus();
    const now = new Date().toISOString();
    const identity = {
      id: `soc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      provider,
      providerUserId: String(providerUserId),
      email: email ? email.toLowerCase().trim() : null,
      profileData,
      createdAt: now,
      updatedAt: now
    };

    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      await pool.query(
        `INSERT INTO social_identities (id, user_id, provider, provider_user_id, email, profile_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (provider, provider_user_id) DO UPDATE
         SET email = EXCLUDED.email, profile_data = EXCLUDED.profile_data, updated_at = EXCLUDED.updated_at`,
        [
          identity.id,
          identity.userId,
          identity.provider,
          identity.providerUserId,
          identity.email,
          JSON.stringify(identity.profileData),
          identity.createdAt,
          identity.updatedAt
        ]
      );
      return identity;
    }

    const db = getFileDbCache();
    if (!db.socialIdentities) db.socialIdentities = [];
    const idx = db.socialIdentities.findIndex(
      (s) => s.provider === provider && s.providerUserId === String(providerUserId)
    );
    if (idx !== -1) {
      db.socialIdentities[idx] = {
        ...db.socialIdentities[idx],
        userId,
        email: identity.email,
        profileData,
        updatedAt: now
      };
    } else {
      db.socialIdentities.push(identity);
    }
    await saveFileDb();
    return identity;
  }

  async getSocialIdentitiesForUser(userId) {
    if (!userId) return [];
    const status = getDbStatus();
    if (status.activeEngine === 'postgres') {
      const pool = getPgPool();
      const res = await pool.query(
        'SELECT * FROM social_identities WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        provider: r.provider,
        providerUserId: r.provider_user_id,
        email: r.email,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
    }

    const db = getFileDbCache();
    const list = db.socialIdentities || [];
    return list.filter((s) => s.userId === userId).map((s) => ({ ...s }));
  }
}

export const userRepository = new UserRepository();

