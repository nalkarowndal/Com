import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiBaseUrl } from '../../src/services/apiBaseUrl.js';

describe('API URL configuration', () => {
  it('connects to /api when Render supplies only a backend origin', () => {
    assert.equal(normalizeApiBaseUrl('https://com-api-ow0l.onrender.com'), 'https://com-api-ow0l.onrender.com/api');
    assert.equal(normalizeApiBaseUrl(' https://com-api-ow0l.onrender.com/ '), 'https://com-api-ow0l.onrender.com/api');
    assert.equal(normalizeApiBaseUrl('http://localhost:4000/'), 'http://localhost:4000/api');
  });

  it('preserves explicitly configured API paths', () => {
    assert.equal(normalizeApiBaseUrl('https://example.com/api/'), 'https://example.com/api');
    assert.equal(normalizeApiBaseUrl('https://example.com/services/api/'), 'https://example.com/services/api');
    assert.equal(normalizeApiBaseUrl('/api/'), '/api');
  });
});
