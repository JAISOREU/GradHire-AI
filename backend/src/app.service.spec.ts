import { describe, it, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import { AppService } from './app.service';
import { PaginatedResponse } from './common/pagination';

/** Minimal PrismaService mock — AppService falls back to in-memory when DB is unavailable. */
const createMockPrisma = () => {
  const mockProfiles: Record<string, { id: string; name: string; focus: string; summary: string | null; createdAt: Date }> = {};
  const latestId = { current: 'cuid-1' };

  const nextId = () => {
    latestId.current = `cuid-${parseInt(latestId.current.split('-')[1], 10) + 1}`;
    return latestId.current;
  };

  return {
    $queryRaw: async () => { throw new Error('DB unavailable'); },
    job: {
      findMany: async () => [],
    },
    profile: {
      async findFirst(args: { where?: { userId?: string } } = {}) {
        const userId = args.where?.userId;
        if (!userId) return null;
        return mockProfiles[userId] ?? null;
      },
      async create(data: { data: { name: string; focus: string; summary: string; userId: string } }) {
        const created = {
          id: nextId(),
          name: data.data.name,
          focus: data.data.focus,
          summary: data.data.summary,
          createdAt: new Date(),
        };
        mockProfiles[data.data.userId] = created;
        return created;
      },
      async upsert(args: { where: { userId: string }; update: { name: string; focus: string; summary: string }; create: { userId: string; name: string; focus: string; summary: string } }) {
        const existing = mockProfiles[args.where.userId];
        if (existing) {
          const updated = { ...existing, ...args.update };
          mockProfiles[args.where.userId] = updated;
          return updated;
        }
        const created = {
          id: nextId(),
          ...args.create,
          createdAt: new Date(),
        };
        mockProfiles[args.create.userId] = created;
        return created;
      },
    },
    user: {
      findFirst: async () => ({ id: 'student-001' }),
    },
  } as any;
};

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    const prisma = createMockPrisma();
    const ai = { getRecommendations: async () => [] } as any;
    const cache = { get: async () => null, set: async () => {} } as any;
    service = new AppService(prisma, ai, cache);
  });

  it('getHealth returns service metadata', () => {
    const health = service.getHealth();

    assert.equal(health.status, 'ok');
    assert.equal(health.service, 'gradture-backend');
    assert.equal(typeof health.version, 'string');
  });

  it('getStudentProfile returns the current profile', async () => {
    const profile = await service.getStudentProfile('student-001');

    assert.equal(profile.id, 'student-001');
    assert.equal(typeof profile.name, 'string');
    assert.equal(typeof profile.focus, 'string');
  });

  it('saveStudentProfile persists the submitted name and focus', async () => {
    const updated = await service.saveStudentProfile('student-001', { name: 'Jordan Lee', focus: 'Data analytics' });

    assert.equal(updated.name, 'Jordan Lee');
    assert.equal(updated.focus, 'Data analytics');
    assert.ok(updated.summary.includes('data analytics'));

    const profile = await service.getStudentProfile('student-001');
    assert.equal(profile.name, 'Jordan Lee');
  });

  it('getJobs prioritizes data-related roles for a data focus', async () => {
    await service.saveStudentProfile('student-001', { name: 'Test', focus: 'Data analytics and dashboards' });

    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; matchScore: number }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(
      jobs.items.some((job) => /data|analytics|engineer/i.test(job.title)),
      'Expected at least one data/analytics/engineer role for a data focus',
    );
    assert.ok(jobs.items[0].matchScore >= jobs.items[jobs.items.length - 1].matchScore);
  });

  it('getJobs prioritizes AI-related roles for an AI focus', async () => {
    await service.saveStudentProfile('student-001', { name: 'Test', focus: 'AI and machine learning' });

    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; matchScore: number }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(
      jobs.items.some((job) => /ai|engineer/i.test(job.title)),
      'Expected at least one AI/engineer role for an AI focus',
    );
  });

  it('getJobs filters by job type when a type query is provided', async () => {
    const internships = await service.getJobs({ type: 'INTERNSHIP' }) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(internships.items.length > 0);
    assert.ok(internships.items.every((job) => job.type === 'INTERNSHIP'));

    const hiring = await service.getJobs({ type: 'HIRING' }) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(hiring.items.length > 0);
    assert.ok(hiring.items.every((job) => job.type === 'HIRING'));
  });

  it('getJobs returns jobs with a type field', async () => {
    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(jobs.items.every((job) => typeof job.type === 'string'));
  });
});

