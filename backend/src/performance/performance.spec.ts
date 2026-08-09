import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { AppService } from '../app.service';
import { CompaniesService } from '../companies/companies.service';
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
