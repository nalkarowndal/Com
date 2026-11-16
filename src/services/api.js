import { defaultContent } from '../data/defaultContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Helper to fetch with JSON parsing and error handling
 */
function getStoredToken() {
  return localStorage.getItem('hbk_auth_token') ||
    localStorage.getItem('prism_auth_token') ||
    localStorage.getItem('hbk_admin_token') ||
    localStorage.getItem('prism_admin_token');
}

function getStoredAdminToken() {
  return localStorage.getItem('hbk_admin_token') ||
    localStorage.getItem('prism_admin_token') ||
    localStorage.getItem('hbk_auth_token') ||
    localStorage.getItem('prism_auth_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    credentials: 'include', // Support HttpOnly cookie
    ...options,
    headers
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.code = json.error?.code || 'API_ERROR';
    err.status = response.status;
    throw err;
  }

  return json;
}

/**
 * Fetch home content from backend API with baseline fallback
 */
export async function fetchHomeContent() {
  try {
    const json = await request('/home');
    if (json.success && json.data) {
      return { data: json.data, source: 'api' };
    }
    throw new Error('Invalid home payload');
  } catch (err) {
    console.info('[HBK API] Home fallback engaged:', err.message);
    return { data: defaultContent, source: 'fallback' };
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories() {
  try {
    const json = await request('/categories');
    return json.data || [];
  } catch (err) {
    console.warn('[HBK API] Categories fallback:', err.message);
    return [
      { id: 'cat-arch', slug: 'architecture', name: 'Architecture', description: 'Monographs and structural forms.' },
      { id: 'cat-travel', slug: 'travel', name: 'Travel', description: 'Contemplative journeys and historic landscapes.' },
      { id: 'cat-art', slug: 'art', name: 'Art', description: 'Minimalist spatial installations and visual critiques.' },
      { id: 'cat-food', slug: 'food', name: 'Food', description: 'Artisanal culinary traditions and aesthetics.' }
    ];
  }
}

/**
 * Fetch single category and its articles
 */
export async function fetchCategoryDetail(slug) {
  try {
    const json = await request(`/categories/${slug}`);
    return json.data;
  } catch (err) {
    console.warn(`[HBK API] Category '${slug}' fallback:`, err.message);
    return null;
  }
}

/**
 * Fetch articles list with filters
 */
export async function fetchArticles({ category, tag, q, page = 1, limit = 12, sort = 'latest', signal } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (tag && tag !== 'all') params.append('tag', tag);
  if (q) params.append('q', q);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (sort) params.append('sort', sort);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/articles${queryStr}`, { signal });
  return {
    items: json.data || [],
    pagination: json.pagination || { total: json.data?.length || 0, page: 1, totalPages: 1 }
  };
}

/**
 * Fetch single article detail by slug
 */
export async function fetchArticleDetail(slug, options = {}) {
  try {
    const json = await request(`/articles/${slug}`, options);
    return json.data;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    // If urban-strorkes fails, return default hero data
    if (slug === 'urban-strorkes') {
      return {
        id: defaultContent.hero.id,
        slug: defaultContent.hero.slug,
        categorySlug: 'architecture',
        badge: defaultContent.hero.badge,
        author: defaultContent.hero.author,
        title: defaultContent.hero.title,
        buttonText: defaultContent.hero.buttonText,
        imageSrc: defaultContent.hero.backgroundImage,
        content: defaultContent.hero.content,
        tags: 'Architecture, Minimalist, Sebastian Weiss',
        isFeatured: true,
        related: []
      };
    }
    throw err;
  }
}

/**
 * Fetch gallery items with optional category filter
 */
export async function fetchGallery(category = null, options = {}) {
  const queryStr = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  try {
    const json = await request(`/gallery${queryStr}`, options);
    return json.data || [];
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('[HBK API] Gallery fallback:', err.message);
    return defaultContent.gallery;
  }
}

/**
 * Search articles
 */
export async function searchArticles({ q, category, page = 1, limit = 12, signal } = {}) {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category && category !== 'all') params.append('category', category);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const json = await request(`/search?${params.toString()}`, { signal });
  return {
    query: json.data?.query || q,
    results: json.data?.results || [],
    pagination: json.data?.pagination || { total: 0, page: 1, totalPages: 1 }
  };
}

/**
 * Unified Authentication API (USER & ADMIN)
 */
export async function apiAuthLogin({ identifier, password }) {
  const json = await request('/auth/login', {
    method: 'POST',
    body: { identifier, password }
  });
  if (json.data?.token) {
    localStorage.setItem('hbk_auth_token', json.data.token);
    localStorage.setItem('prism_auth_token', json.data.token);
    if (json.data?.user?.role === 'admin') {
      localStorage.setItem('hbk_admin_token', json.data.token);
      localStorage.setItem('prism_admin_token', json.data.token);
    }
  }
  return json.data;
}

export async function apiAuthRegister({ username, email, password, name }) {
  const json = await request('/auth/register', {
    method: 'POST',
    body: { username, email, password, name }
  });
  if (json.data?.token) {
    localStorage.setItem('hbk_auth_token', json.data.token);
    localStorage.setItem('prism_auth_token', json.data.token);
  }
  return json.data;
}

export async function apiAuthLogout() {
  localStorage.removeItem('hbk_auth_token');
  localStorage.removeItem('prism_auth_token');
  localStorage.removeItem('hbk_admin_token');
  localStorage.removeItem('prism_admin_token');
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore logout errors
  }
}

export async function apiAuthGetSession() {
  try {
    const json = await request('/auth/session');
    return json.data;
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      role: 'guest'
    };
  }
}

export async function apiAuthGetMe() {
  const json = await request('/auth/me');
  return json.data?.user;
}

export async function apiAuthUpdateProfile(updates) {
  const json = await request('/auth/profile', {
    method: 'PUT',
    body: updates
  });
  if (json.data?.token) {
    localStorage.setItem('hbk_auth_token', json.data.token);
    localStorage.setItem('prism_auth_token', json.data.token);
  }
  return json.data?.user;
}

export async function apiAuthChangePassword({ currentPassword, newPassword }) {
  const json = await request('/auth/password', {
    method: 'PUT',
    body: { currentPassword, newPassword }
  });
  return json.data;
}

/**
 * Social & Federated Authentication API (Google, Kakao)
 */
export async function apiAuthGetConfig() {
  const json = await request('/auth/config');
  return json.data;
}

export async function apiAuthGoogle(idToken, testProfile = null) {
  const json = await request('/auth/google', {
    method: 'POST',
    body: { idToken, testProfile }
  });
  if (json.data?.token) {
    localStorage.setItem('hbk_auth_token', json.data.token);
    localStorage.setItem('prism_auth_token', json.data.token);
  }
  return json.data;
}

export async function apiAuthKakao({ code, state, redirectUri, testProfile = null }) {
  const json = await request('/auth/kakao', {
    method: 'POST',
    body: { code, state, redirectUri, testProfile }
  });
  if (json.data?.token) {
    localStorage.setItem('hbk_auth_token', json.data.token);
    localStorage.setItem('prism_auth_token', json.data.token);
  }
  return json.data;
}

/**
 * Admin User Management API
 */
export async function apiAdminGetUsers({ page = 1, limit = 50, search = '', role = '' } = {}) {
  const params = new URLSearchParams();
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (search) params.append('search', search);
  if (role && role !== 'all') params.append('role', role);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/admin/users${queryStr}`);
  return {
    users: json.data || [],
    pagination: json.pagination || { total: json.data?.length || 0, page: 1, totalPages: 1 }
  };
}

export async function apiAdminUpdateUserStatus(id, { status, role }) {
  const json = await request(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: { status, role }
  });
  return json.data;
}

export async function apiAdminDeleteUser(id) {
  const json = await request(`/admin/users/${id}`, {
    method: 'DELETE'
  });
  return json.data;
}

/**
 * Admin Authentication (Backward Compatibility)
 */
export async function apiAdminLogin(username, password) {
  return await apiAuthLogin({ identifier: username, password });
}

export async function apiAdminLogout() {
  return await apiAuthLogout();
}

export async function apiAdminGetMe() {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/me', { headers });
  return json.data?.user;
}

export async function apiAdminGetStats() {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/stats', { headers });
  return json.data;
}

export async function apiAdminCreateArticle(data) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/articles', {
    method: 'POST',
    headers,
    body: data
  });
  return json.data;
}

export async function apiAdminUpdateArticle(id, updates) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/articles/${id}`, {
    method: 'PATCH',
    headers,
    body: updates
  });
  return json.data;
}

export async function apiAdminDeleteArticle(id) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/articles/${id}`, {
    method: 'DELETE',
    headers
  });
  return json.data;
}

export async function apiAdminGetAuditLogs() {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/audit-logs', { headers });
  return json.data || [];
}

/**
 * Public Media API
 */
export async function fetchMediaAssets({ category, search, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/media${queryStr}`);
  return {
    items: json.data || [],
    pagination: json.pagination || { total: json.data?.length || 0, page: 1, totalPages: 1 }
  };
}

/**
 * Admin Media Management API
 */
export async function apiAdminGetMedia({ category, search, isApproved, isOriginal, page = 1, limit = 50 } = {}) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  if (isApproved !== undefined && isApproved !== null) params.append('isApproved', isApproved);
  if (isOriginal !== undefined && isOriginal !== null) params.append('isOriginal', isOriginal);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/admin/media${queryStr}`, { headers });
  return {
    items: json.data || [],
    pagination: json.pagination || { total: json.data?.length || 0, page: 1, totalPages: 1 }
  };
}

export async function apiAdminGetMediaById(id) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/media/${id}`, { headers });
  return json.data;
}

export async function apiAdminUploadMedia(formData) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  // Note: let browser set multipart/form-data boundary
  const json = await request('/admin/media/upload', {
    method: 'POST',
    headers,
    body: formData
  });
  return json.data;
}

export async function apiAdminUpdateMedia(id, updates) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/media/${id}`, {
    method: 'PUT',
    headers,
    body: updates
  });
  return json.data;
}

export async function apiAdminDeleteMedia(id) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/media/${id}`, {
    method: 'DELETE',
    headers
  });
  return json.data;
}

export async function apiAdminDetectDuplicateMedia({ filename, fileSize }) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/media/detect-duplicate', {
    method: 'POST',
    headers,
    body: { filename, fileSize }
  });
  return json;
}

export async function apiAdminRecommendMedia({ title, content, tags, categorySlug }) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (content) params.append('content', content);
  if (tags) params.append('tags', tags);
  if (categorySlug) params.append('categorySlug', categorySlug);

  const json = await request(`/admin/media/recommend?${params.toString()}`, { headers });
  return json.data || [];
}

export async function apiAdminRollbackMedia({ targetType, targetId }) {
  const token = getStoredAdminToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/media/rollback', {
    method: 'POST',
    headers,
    body: { targetType, targetId }
  });
  return json.data;
}
