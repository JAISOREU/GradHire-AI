import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';

function createMockPrisma() {
  return {
    $queryRaw: async () => { throw new Error('DB unavailable'); },
    job: { findMany: async () => [] },
    company: { findMany: async () => [] },
    application: { findMany: async () => [] },
    notification: { findMany: async () => [] },
    user: { findMany: async () => [] },
    settings: { findFirst: async () => null },
    $disconnect: async () => {},
  };
}

test('Security - AppService handles missing database gracefully', async () => {
  const prisma = createMockPrisma();
  const service = new AppService(prisma as unknown as PrismaService, { getRecommendations: async () => [] } as any, { get: async () => null, set: async () => {} } as any);

  const health = service.getHealth();
  assert.strictEqual(health.status, 'ok');
  assert.strictEqual(health.service, 'gradture-backend');
});

test('Security - jobs endpoint does not leak internal errors', async () => {
  const prisma = createMockPrisma();
  const service = new AppService(prisma as unknown as PrismaService, { getRecommendations: async () => [] } as any, { get: async () => null, set: async () => {} } as any);

  const jobs = await service.getJobs({});
  assert.ok(Array.isArray(jobs.items));
});

test('Security - saved jobs endpoint does not leak internal errors', async () => {
  const prisma = createMockPrisma();
  const service = new AppService(prisma as unknown as PrismaService, { getRecommendations: async () => [] } as any, { get: async () => null, set: async () => {} } as any);

  const saved = await service.listSavedJobs('student-1');
  assert.ok(Array.isArray(saved.items));
});
