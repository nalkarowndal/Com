import { defaultContent } from '../data/defaultContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Helper to fetch with JSON parsing and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    credentials: 'include', // Support HttpOnly admin cookie
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
    console.info('[PRISM API] Home fallback engaged:', err.message);
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
    console.warn('[PRISM API] Categories fallback:', err.message);
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
    console.warn(`[PRISM API] Category '${slug}' fallback:`, err.message);
    return null;
  }
}

/**
 * Fetch articles list with filters
 */
export async function fetchArticles({ category, q, page = 1, limit = 12, sort = 'latest' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (q) params.append('q', q);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (sort) params.append('sort', sort);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/articles${queryStr}`);
  return {
    items: json.data || [],
    pagination: json.pagination || { total: json.data?.length || 0, page: 1, totalPages: 1 }
  };
}

/**
 * Fetch single article detail by slug
 */
export async function fetchArticleDetail(slug) {
  try {
    const json = await request(`/articles/${slug}`);
    return json.data;
  } catch (err) {
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
export async function fetchGallery(category = null) {
  const queryStr = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  try {
    const json = await request(`/gallery${queryStr}`);
    return json.data || [];
  } catch (err) {
    console.warn('[PRISM API] Gallery fallback:', err.message);
    return defaultContent.gallery;
  }
}

/**
 * Search articles
 */
export async function searchArticles({ q, category, page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category && category !== 'all') params.append('category', category);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const json = await request(`/search?${params.toString()}`);
  return {
    query: json.data?.query || q,
    results: json.data?.results || [],
    pagination: json.data?.pagination || { total: 0, page: 1, totalPages: 1 }
  };
}

/**
 * Admin Authentication
 */
export async function apiAdminLogin(username, password) {
  const json = await request('/admin/login', {
    method: 'POST',
    body: { username, password }
  });
  if (json.data?.token) {
    localStorage.setItem('prism_admin_token', json.data.token);
  }
  return json.data;
}

export async function apiAdminLogout() {
  localStorage.removeItem('prism_admin_token');
  try {
    await request('/admin/logout', { method: 'POST' });
  } catch {
    // Ignore logout errors
  }
}

export async function apiAdminGetMe() {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/me', { headers });
  return json.data?.user;
}

export async function apiAdminGetStats() {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/stats', { headers });
  return json.data;
}

export async function apiAdminCreateArticle(data) {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/articles', {
    method: 'POST',
    headers,
    body: data
  });
  return json.data;
}

export async function apiAdminUpdateArticle(id, updates) {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/articles/${id}`, {
    method: 'PATCH',
    headers,
    body: updates
  });
  return json.data;
}

export async function apiAdminDeleteArticle(id) {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request(`/admin/articles/${id}`, {
    method: 'DELETE',
    headers
  });
  return json.data;
}

export async function apiAdminGetAuditLogs() {
  const token = localStorage.getItem('prism_admin_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const json = await request('/admin/audit-logs', { headers });
  return json.data || [];
}
