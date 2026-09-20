import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { resolveCookiePolicy } from './cookie-policy';

describe('resolveCookiePolicy', () => {
  it('uses SameSite=None + Secure in production', () => {
    const policy = resolveCookiePolicy({ isProduction: true, corsOrigins: ['https://app.example.com'] });
    assert.equal(policy.sameSite, 'none');
    assert.equal(policy.secure, true);
  });

  it('uses SameSite=Lax in dev when all allowed origins share the server host', () => {
    const policy = resolveCookiePolicy({ isProduction: false, corsOrigins: ['http://localhost:5173', 'http://localhost:3000'] });
    assert.equal(policy.sameSite, 'lax');
    assert.equal(policy.secure, false);
  });

  it('uses SameSite=None in dev when an allowed origin is cross-site to the API', () => {
    // 127.0.0.1 vs localhost are different sites in the browser: cookies from
    // localhost:3000 will NOT be attached to cross-site XHR with SameSite=Lax.
    const policy = resolveCookiePolicy({
      isProduction: false,
      serverHost: 'localhost',
      corsOrigins: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://localhost:3000'],
    });
    assert.equal(policy.sameSite, 'none');
  });

  it('requires Secure when SameSite=None', () => {
    const policy = resolveCookiePolicy({ isProduction: false, serverHost: 'localhost', corsOrigins: ['http://127.0.0.1:5173'] });
    assert.equal(policy.secure, true);
  });

  it('defaults to Lax when CORS origins are absent', () => {
    const policy = resolveCookiePolicy({ isProduction: false, corsOrigins: [] });
    assert.equal(policy.sameSite, 'lax');
  });
});