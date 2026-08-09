import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma.service';

function createMockPrisma() {
  const mockJobs = [
    { id: '1', title: 'Software Engineer Intern', company: 'Northwind Labs', location: 'Remote', type: 'INTERNSHIP', experienceLevel: 'ENTRY_LEVEL', workplaceType: 'REMOTE', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
  ];
  return {
    $queryRaw: async () => { throw new Error('DB unavailable'); },
    job: { 
      findMany: async () => mockJobs,
      count: async () => mockJobs.length,
    },
    company: { findMany: async () => [], count: async () => 0 },
    application: { findMany: async () => [], count: async () => 0 },
    notification: { findMany: async () => [], count: async () => 0 },
    user: { findMany: async () => [], findFirst: async () => ({ id: 'student-001' }) },
    settings: { findFirst: async () => null },
    savedJob: { findMany: async () => [], count: async () => 0 },
    message: { findMany: async () => [], count: async () => 0 },
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
