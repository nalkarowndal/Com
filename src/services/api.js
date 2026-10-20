import { defaultContent } from '../data/defaultContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Fetch home content from the backend API with fallback to defaultContent
 */
export async function fetchHomeContent() {
  try {
    const response = await fetch(`${API_BASE_URL}/home`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      return {
        data: json.data,
        source: 'api'
      };
    }
    throw new Error('Invalid API payload');
  } catch (err) {
    console.info('[PRISM API] Backend unavailable, using robust default content fallback:', err.message);
    return {
      data: defaultContent,
      source: 'fallback'
    };
  }
}

/**
 * Admin Login
 */
export async function apiAdminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Login failed');
  }
  return json.data;
}

/**
 * Update article content via Admin API
 */
export async function apiUpdateArticle(id, articleData) {
  const response = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(articleData)
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Update failed');
  }
  return json.data;
}
