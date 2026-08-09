import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { AppService } from '../app.service';
import { CompaniesService } from '../companies/companies.service';
import { PrismaService } from '../prisma.service';

function createMockPrisma() {
  return {
    $queryRaw: async () => { throw new Error('DB unavailable'); },
    job: { findMany: async () => [] },
    company: { findMany: async () => [], count: async () => 0 },
    application: { findMany: async () => [] },
    notification: { findMany: async () => [] },
    user: { findMany: async () => [] },
    settings: { findFirst: async () => null },
    savedJob: { findMany: async () => [], count: async () => 0 },
    message: { findMany: async () => [], count: async () => 0 },
    $disconnect: async () => {},
  };
}

test('Performance - health check responds quickly', async () => {
  const prisma = createMockPrisma();
  const service = new AppService(prisma as unknown as PrismaService, { getRecommendations: async () => [] } as any, { get: async () => null, set: async () => {} } as any);

  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    service.getHealth();
  }
  const avg = (Date.now() - start) / 100;
  assert.ok(avg < 10, `Health check avg ${avg}ms exceeded 10ms threshold`);
});

test('Performance - jobs listing responds quickly', async () => {
  const prisma = createMockPrisma();
  const service = new AppService(prisma as unknown as PrismaService, { getRecommendations: async () => [] } as any, { get: async () => null, set: async () => {} } as any);

  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    await service.getJobs({});
  }
  const avg = (Date.now() - start) / 100;
  assert.ok(avg < 10, `Jobs listing avg ${avg}ms exceeded 10ms threshold`);
});

test('Performance - companies listing responds quickly', async () => {
  const prisma = createMockPrisma();
  const service = new CompaniesService(prisma as unknown as PrismaService);

  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    await service.findAll();
  }
  const avg = (Date.now() - start) / 100;
  assert.ok(avg < 10, `Companies listing avg ${avg}ms exceeded 10ms threshold`);
});
