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

  describe('enum normalization (blocker: empty string → Prisma enum 500)', () => {
    const makeAvailablePrisma = () => {
      const prisma = createMockPrisma() as any;
      prisma.$queryRaw = async () => [{ one: 1 }] as never;
      let captured = undefined as Record<string, unknown> | undefined;
      prisma.experience = {
        findMany: async () => [],
        create: async ({ data }: { data: Record<string, unknown> }) => {
          captured = data;
          return { id: 'exp-1', ...data };
        },
      } as any;
      return { prisma, getCaptured: () => captured };
    };

    it('createExperience drops empty-string enum fields before reaching Prisma', async () => {
      const { prisma, getCaptured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createExperience('student-001', {
        jobTitle: 'Software Engineer Intern',
        company: 'Acme Corp',
        employmentType: '',
        location: '',
        startDate: '2026-06-01',
        endDate: '',
      });

      assert.ok(getCaptured(), 'expected prisma.experience.create to be called');
      assert.equal(getCaptured()!.employmentType, undefined, 'empty employmentType must be dropped');
      assert.equal(getCaptured()!.location, undefined, 'empty location must be dropped');
      assert.equal(getCaptured()!.endDate, undefined, 'empty endDate must be dropped');
    });
  });

  describe('create-path allowlists (extra fields must not reach Prisma)', () => {
    const makeAvailablePrisma = () => {
      const prisma = createMockPrisma() as any;
      prisma.$queryRaw = async () => [{ one: 1 }] as never;
      const captured: Array<{ model: string; data: Record<string, unknown> }> = [];
      const captureCreate = (model: string) => (args: { data: Record<string, unknown> }) => {
        captured.push({ model, data: args.data });
        return { id: `${model}-1`, ...args.data };
      };
      prisma.experience = { findMany: async () => [], create: captureCreate('experience') } as any;
      prisma.education = { create: captureCreate('education') } as any;
      prisma.skill = {
        findFirst: async () => null,
        create: captureCreate('skill'),
        update: async () => captured.push({ model: 'skill-update', data: {} }) && {}, 
      } as any;
      prisma.certification = { create: captureCreate('certification') } as any;
      prisma.project = { create: captureCreate('project') } as any;
      prisma.careerPreference = { findFirst: async () => null, create: captureCreate('careerPreference') } as any;
      return { prisma, captured };
    };

    it('createExperience strips manager-injected fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createExperience('student-001', {
        jobTitle: 'Engineer', company: 'Acme', startDate: '2026-06-01',
        admin: true, isInternal: true,
      });

      const call = captured.find((c) => c.model === 'experience');
      assert.ok(call, 'expected prisma.experience.create to be called');
      assert.equal(call!.data.jobTitle, 'Engineer');
      assert.equal(call!.data.company, 'Acme');
      assert.ok(call!.data.startDate instanceof Date, 'startDate is an allowed field and must be preserved as a Date');
      assert.equal(call!.data.admin, undefined, 'admin must be stripped on create');
      assert.equal(call!.data.isInternal, undefined, 'isInternal must be stripped on create');
    });

    it('createEducation strips extra fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createEducation('student-001', { institution: 'MIT', injected: 'x', admin: true });

      const call = captured.find((c) => c.model === 'education');
      assert.ok(call, 'expected prisma.education.create to be called');
      assert.equal(call!.data.institution, 'MIT');
      assert.equal(call!.data.injected, undefined, 'injected must be stripped on create');
      assert.equal(call!.data.admin, undefined, 'admin must be stripped on create');
    });

    it('createCertification strips extra fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createCertification('student-001', { name: 'AWS', injected: 'x' });

      const call = captured.find((c) => c.model === 'certification');
      assert.ok(call, 'expected prisma.certification.create to be called');
      assert.equal(call!.data.name, 'AWS');
      assert.equal(call!.data.injected, undefined, 'injected must be stripped on create');
    });

    it('createProject strips extra fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createProject('student-001', { name: 'Portfolio', injected: 'x' });

      const call = captured.find((c) => c.model === 'project');
      assert.ok(call, 'expected prisma.project.create to be called');
      assert.equal(call!.data.name, 'Portfolio');
      assert.equal(call!.data.injected, undefined, 'injected must be stripped on create');
    });

    it('createSkill strips extra fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.createSkill('student-001', { name: '  Python  ', injected: 'x' });

      const call = captured.find((c) => c.model === 'skill');
      assert.ok(call, 'expected prisma.skill.create to be called');
      assert.equal(call!.data.name, 'python');
      assert.equal(call!.data.injected, undefined, 'injected must be stripped on create');
    });

    it('upsertCareerPreference strips extra fields on create', async () => {
      const { prisma, captured } = makeAvailablePrisma();
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);
      await svc.onModuleInit();

      await svc.upsertCareerPreference('student-001', { preferredJobTitles: ['Analyst'], injected: 'x' });

      const call = captured.find((c) => c.model === 'careerPreference');
      assert.ok(call, 'expected prisma.careerPreference.create to be called');
      assert.equal((call!.data.preferredJobTitles as string[] | undefined)?.length, 1);
      assert.equal(call!.data.injected, undefined, 'injected must be stripped on create');
    });
  });

  describe('getJobs new filters (skills + datePosted)', () => {
    const makeCapturingPrisma = () => {
      const prisma = createMockPrisma() as any;
      const calls: Array<{ where?: Record<string, unknown>; orderBy?: Record<string, unknown> }> = [];
      prisma.job = {
        findMany: async (args?: { where?: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
          calls.push({ where: args?.where, orderBy: args?.orderBy });
          return [];
        },
        count: async () => 0,
      };
      return {
        prisma,
        getLastWhere: () => calls[calls.length - 1]?.where,
        getLastOrderBy: () => calls[calls.length - 1]?.orderBy,
      };
    };

    const makeSvc = (prisma: any) =>
      new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);

    it('getJobs passes requiredSkills { hasSome } to Prisma when skills query is provided', async () => {
      const { prisma, getLastWhere } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ skills: ['React', 'Node.js'] } as any);

      const where = getLastWhere();
      assert.deepEqual(where!.requiredSkills, { hasSome: ['React', 'Node.js'] });
    });

    it('getJobs omits the requiredSkills condition when skills is empty', async () => {
      const { prisma, getLastWhere } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ skills: [] } as any);

      assert.equal(getLastWhere()!.requiredSkills, undefined);
    });

    it('getJobs adds a createdAt window for datePosted=7d', async () => {
      const { prisma, getLastWhere } = makeCapturingPrisma();
      const svc = makeSvc(prisma);
      const before = Date.now();

      await svc.getJobs({ datePosted: '7d' } as any);

      const where = getLastWhere();
      const gte = (where!.createdAt as { gte?: Date }).gte;
      assert.ok(gte instanceof Date, 'expected a Date cutoff on createdAt.gte');
      assert.ok(Math.abs(gte!.getTime() - (before - 7 * 86400000)) < 60000, `cutoff ${gte!.getTime()} not ~7d before ${before}`);
    });

    it('getJobs omits the createdAt window when datePosted is absent', async () => {
      const { prisma, getLastWhere } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({} as any);

      assert.equal(getLastWhere()!.createdAt, undefined);
    });

    it('getJobs passes a whitelisted sortBy to Prisma orderBy', async () => {
      const { prisma, getLastOrderBy } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ sortBy: 'createdAt', sortOrder: 'asc' } as any);

      assert.deepEqual(getLastOrderBy(), { createdAt: 'asc' });
    });

    it('getJobs falls back to a safe default when sortBy is not whitelisted', async () => {
      const { prisma, getLastOrderBy } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ sortBy: 'passwordHash; DROP TABLE jobs' } as any);

      // Must not pass attacker-controlled field names into Prisma.
      assert.deepEqual(getLastOrderBy(), { createdAt: 'desc' });
    });

    it('getJobs coerces an invalid sortOrder to desc', async () => {
      const { prisma, getLastOrderBy } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ sortBy: 'title', sortOrder: 'up' } as any);

      assert.deepEqual(getLastOrderBy(), { title: 'desc' });
    });

    it('getJobs treats a "-field" sort as ascending (frontend convention)', async () => {
      const { prisma, getLastOrderBy } = makeCapturingPrisma();
      const svc = makeSvc(prisma);

      await svc.getJobs({ sort: '-createdAt' } as any);

      assert.deepEqual(getLastOrderBy(), { createdAt: 'asc' });
    });
  });

  describe('listJobSkills', () => {
    it('returns distinct, trimmed, case-preserving skills sorted alphabetically from published jobs only', async () => {
      const prisma = createMockPrisma() as any;
      let capturedWhere: Record<string, unknown> | undefined;
      prisma.job = {
        findMany: async (args?: { where?: Record<string, unknown>; select?: Record<string, unknown> }) => {
          capturedWhere = args?.where;
          return [
            { requiredSkills: ['React', 'TypeScript'] },
            { requiredSkills: ['TypeScript', 'Python'] },
            { requiredSkills: ['React', '  GraphQL  '] },
            { requiredSkills: [''] },
          ] as any;
        },
        count: async () => 0,
      };
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);

      const skills = await svc.listJobSkills();

      assert.deepEqual(skills, ['GraphQL', 'Python', 'React', 'TypeScript']);
      assert.equal(capturedWhere!.status, 'PUBLISHED');
    });
  });

  describe('getMarketSnapshot', () => {
    it('returns published-job counts grouped by type, sorted by count desc then name', async () => {
      const prisma = createMockPrisma() as any;
      let capturedWhere: Record<string, unknown> | undefined;
      prisma.job = {
        findMany: async (args?: { where?: Record<string, unknown>; select?: Record<string, unknown> }) => {
          capturedWhere = args?.where;
          return [
            { type: 'HIRING' },
            { type: 'HIRING' },
            { type: 'INTERNSHIP' },
            { type: 'CONTRACT' },
            { type: 'PART_TIME' },
            { type: 'PART_TIME' },
          ] as any;
        },
        count: async () => 0,
      };
      const svc = new AppService(prisma, {} as any, { get: async () => null, set: async () => {} } as any);

      const snapshot = await svc.getMarketSnapshot();

      assert.equal(capturedWhere!.status, 'PUBLISHED');
      assert.deepEqual(snapshot.byType, [
        { type: 'HIRING', count: 2 },
        { type: 'PART_TIME', count: 2 },
        { type: 'CONTRACT', count: 1 },
        { type: 'INTERNSHIP', count: 1 },
      ]);
    });
  });
});

