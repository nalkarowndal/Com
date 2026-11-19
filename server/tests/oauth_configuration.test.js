import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { env } from '../src/config/env.js';
import { authService } from '../src/services/auth.service.js';

describe('OAuth deployment configuration', () => {
  it('normalizes Render values and derives the Kakao callback from the frontend origin', () => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      const { env } = await import('./server/src/config/env.js');
      console.log(JSON.stringify({
        origin: env.FRONTEND_ORIGIN,
        callback: env.KAKAO_REDIRECT_URI,
        google: env.GOOGLE_CLIENT_ID,
        kakao: env.KAKAO_REST_API_KEY
      }));
    `], {
      cwd: new URL('../../', import.meta.url),
      encoding: 'utf8',
      env: {
        ...process.env,
        FRONTEND_ORIGIN: ' https://reader.example.com/ ',
        KAKAO_REDIRECT_URI: '',
        GOOGLE_CLIENT_ID: ' client.apps.googleusercontent.com ',
        KAKAO_REST_API_KEY: ' kakao-key '
      }
    });
    assert.equal(result.status, 0, result.stderr);
    const config = JSON.parse(result.stdout.trim().split('\n').at(-1));
    assert.deepEqual(config, {
      origin: 'https://reader.example.com',
      callback: 'https://reader.example.com/oauth/callback/kakao',
      google: 'client.apps.googleusercontent.com',
      kakao: 'kakao-key'
    });
  });

  it('keeps secrets private and rejects simulated identities in production', async () => {
    const previous = env.NODE_ENV;
    env.NODE_ENV = 'production';
    try {
      const config = authService.getAuthConfig();
      assert.equal(config.allowSimulation, false);
      assert.equal(config.googleClientSecret, undefined);
      assert.equal(config.kakaoClientSecret, undefined);
      await assert.rejects(authService.handleGoogleLogin({
        testProfile: { sub: 'forged', email: 'reader@example.com' }
      }), { code: 'SIMULATION_DISABLED', status: 403 });
      await assert.rejects(authService.handleKakaoLogin({
        testProfile: { id: 'forged', email: 'reader@example.com' }
      }), { code: 'SIMULATION_DISABLED', status: 403 });
    } finally {
      env.NODE_ENV = previous;
    }
  });

  it('rejects Google verification failures even when a token claims to be a test token', async () => {
    const previousMode = env.NODE_ENV;
    const previousClient = env.GOOGLE_CLIENT_ID;
    const previousFetch = globalThis.fetch;
    env.NODE_ENV = 'production';
    env.GOOGLE_CLIENT_ID = 'client.apps.googleusercontent.com';
    let verificationRequests = 0;
    globalThis.fetch = async () => {
      verificationRequests++;
      return { ok: false };
    };
    const payload = Buffer.from(JSON.stringify({
      sub: 'forged', email: 'reader@example.com', is_test_token: true
    })).toString('base64url');
    try {
      await assert.rejects(authService.verifyGoogleIdToken(`header.${payload}.signature`), {
        code: 'INVALID_TOKEN', status: 401
      });
      assert.equal(verificationRequests, 1);
      env.GOOGLE_CLIENT_ID = '';
      await assert.rejects(authService.verifyGoogleIdToken(`header.${payload}.signature`), {
        code: 'OAUTH_NOT_CONFIGURED', status: 503
      });
    } finally {
      env.NODE_ENV = previousMode;
      env.GOOGLE_CLIENT_ID = previousClient;
      globalThis.fetch = previousFetch;
    }
  });
});
