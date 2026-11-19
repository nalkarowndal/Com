export function normalizeApiBaseUrl(baseUrl) {
  const normalized = baseUrl.trim().replace(/\/+$/, '');
  // Render environment variables sometimes contain only the backend origin.
  if (/^https?:\/\/[^/?#]+$/i.test(normalized)) {
    return `${normalized}/api`;
  }
  return normalized;
}
