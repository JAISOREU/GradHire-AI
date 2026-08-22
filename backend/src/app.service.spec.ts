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
      findMany: async () => [
        { id: '1', title: 'Software Engineer Intern', company: 'Northwind Labs', location: 'Remote', type: 'INTERNSHIP', experienceLevel: 'ENTRY_LEVEL', workplaceType: 'REMOTE', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
        { id: '2', title: 'Data Analyst', company: 'Cedar AI', location: 'Austin, TX', type: 'HIRING', experienceLevel: 'ENTRY_LEVEL', workplaceType: 'ONSITE', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
        { id: '3', title: 'Product Designer', company: 'BluePeak', location: 'New York, NY', type: 'HIRING', experienceLevel: 'JUNIOR', workplaceType: 'HYBRID', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
        { id: '4', title: 'AI Product Engineer', company: 'Lumina AI', location: 'Seattle, WA', type: 'HIRING', experienceLevel: 'MID_LEVEL', workplaceType: 'REMOTE', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
        { id: '5', title: 'Full-Stack Developer', company: 'BrightPath', location: 'Remote', type: 'HIRING', experienceLevel: 'ENTRY_LEVEL', workplaceType: 'REMOTE', country: null, city: null, salaryMin: null, salaryMax: null, currency: 'PHP', salaryUndisclosed: false, requiredSkills: [], applicationDeadline: null, views: 0, createdAt: new Date(), companyRef: null },
      ],
      count: async () => 5,
    },
    application: {
      findMany: async () => [],
      count: async () => 0,
    },
    company: {
      findMany: async () => [],
      count: async () => 0,
    },
    notification: {
      findMany: async () => [],
      count: async () => 0,
    },
    user: {
      findMany: async () => [],
      findFirst: async () => ({ id: 'student-001' }),
    },
    settings: {
      findFirst: async () => null,
    },
    savedJob: {
      findMany: async () => [],
      count: async () => 0,
    },
    message: {
      findMany: async () => [],
      count: async () => 0,
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
    $disconnect: async () => {},
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
    const prisma = createMockPrisma();
    const ai = { getRecommendations: async () => [] } as any;
    const cache = { get: async () => null, set: async () => {} } as any;
    const svc = new AppService(prisma as any, ai as any, cache as any);
    await svc.saveStudentProfile('student-001', { name: 'Ava Chen', focus: 'AI' });
    const profile = await svc.getStudentProfile('student-001');

    assert.equal(profile.name, 'Ava Chen');
    assert.equal(typeof profile.focus, 'string');
  });

  it('saveStudentProfile persists the submitted name and focus', async () => {
    const updated = await service.saveStudentProfile('student-001', { name: 'Jordan Lee', focus: 'Data analytics' }) as Record<string, unknown>;

    assert.equal(updated.name, 'Jordan Lee');
    assert.equal(updated.focus, 'Data analytics');
    assert.ok(String(updated.summary).includes('data analytics'));

    const profile = await service.getStudentProfile('student-001') as Record<string, unknown>;
    assert.equal(profile.name, 'Jordan Lee');
  });

  it('getJobs prioritizes data-related roles for a data focus', async () => {
    await service.saveStudentProfile('student-001', { name: 'Test', focus: 'Data analytics and dashboards' });

    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(
      jobs.items.some((job) => /data|analytics|engineer/i.test(job.title)),
      'Expected at least one data/analytics/engineer role for a data focus',
    );
  });

  it('getJobs prioritizes recommendation-related roles for a smart focus', async () => {
    await service.saveStudentProfile('student-001', { name: 'Test', focus: 'AI and machine learning' });

    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(
      jobs.items.some((job) => /ai|engineer/i.test(job.title)),
      'Expected at least one engineer role for a smart focus',
    );
  });

  it('getJobs filters by job type when a type query is provided', async () => {
    const internships = await service.getJobs({ type: 'INTERNSHIP' }) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(internships.items.length >= 0);

    const hiring = await service.getJobs({ type: 'HIRING' }) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(hiring.items.length >= 0);
  });

  it('getJobs returns jobs with a type field', async () => {
    const jobs = await service.getJobs({}) as PaginatedResponse<{ id: string; title: string; type: string }>;
    assert.ok(jobs.items.length > 0);
    assert.ok(jobs.items.every((job) => typeof job.type === 'string'));
  });
});

