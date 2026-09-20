import * as assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { CacheService } from './cache.service';

const prevUrl = process.env.REDIS_URL;
const prevPassword = process.env.REDIS_PASSWORD;
let created: CacheService[] = [];

afterEach(() => {
  for (const svc of created) svc.disconnect();
  created = [];
  if (prevUrl === undefined) delete process.env.REDIS_URL;
  else process.env.REDIS_URL = prevUrl;
  if (prevPassword === undefined) delete process.env.REDIS_PASSWORD;
  else process.env.REDIS_PASSWORD = prevPassword;
});

function makeService(): CacheService {
  const svc = new CacheService();
  created.push(svc);
  return svc;
}

test('CacheService is disabled when REDIS_URL is unset', () => {
  delete process.env.REDIS_URL;
  const svc = makeService();
  assert.equal(svc.isEnabled(), false);
});

test('CacheService is enabled when REDIS_URL is set', () => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  const svc = makeService();
  assert.equal(svc.isEnabled(), true);
});

test('ping() returns null when disabled (not configured), distinct from down', async () => {
  delete process.env.REDIS_URL;
  const svc = makeService();
  assert.equal(await svc.ping(), null);
});