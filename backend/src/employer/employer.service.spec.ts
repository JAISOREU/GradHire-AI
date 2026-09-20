import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { EmployerService } from './employer.service';

function createMockPrisma() {
  const calls = {
    jobCreate: [] as Array<Record<string, unknown>>,
    jobLocationCreate: [] as Array<Record<string, unknown>>,
    syncJobCompany: [] as Array<Record<string, unknown>>,
  };

  const prisma = {
    job: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        calls.jobCreate.push(data);
        return { id: 'job-1', ...data };
      },
    },
    jobLocation: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        calls.jobLocationCreate.push(data);
        return { id: 'loc-1', ...data };
      },
    },
    syncJobCompany: async (jobId: string, companyId?: string) => {
      calls.syncJobCompany.push({ jobId, companyId });
    },
    jobSkill: { createMany: async () => ({ count: 0 }) },
    jobBenefit: { createMany: async () => ({ count: 0 }) },
    jobRequirement: { createMany: async () => ({ count: 0 }) },
    company: { findUnique: async () => null },
  };

  return { prisma, calls };
}

const cacheMock = {
  invalidate: async () => undefined,
};

const employerUser = { id: 'emp-1', email: 'employer@demo.gradhire.ai', role: 'EMPLOYER' } as never;

const baseBody = {
  title: 'QA Engineer',
  company: 'Acme Corp',
  requiredQualifications: 'BS in Computer Science',
  requiredSkills: ['TypeScript'],
  experienceLevel: 'SENIOR',
  workplaceType: 'REMOTE',
  type: 'HIRING',
  description: 'Build great software for graduates.',
  responsibilities: 'Ship features and fix bugs.',
  status: 'PUBLISHED',
};

test('createJob parses a two-part string location into structured city/country', async () => {
  const { prisma, calls } = createMockPrisma();
  const service = new EmployerService(prisma as never, cacheMock as never);

  const job = await service.createJob(employerUser, { ...baseBody, location: 'Austin, TX' } as never);

  assert.equal(job.id, 'job-1');
  const created = calls.jobCreate[0];
  assert.equal(created.city, 'Austin');
  assert.equal(created.country, 'TX');
  const loc = calls.jobLocationCreate[0];
  assert.equal(loc.city, 'Austin');
  assert.equal(loc.country, 'TX');
});

test('createJob with a single-part location stores it as city and skips the strict jobLocation row', async () => {
  const { prisma, calls } = createMockPrisma();
  const service = new EmployerService(prisma as never, cacheMock as never);

  await service.createJob(employerUser, { ...baseBody, location: 'Remote' } as never);

  assert.equal(calls.jobCreate[0].city, 'Remote');
  assert.equal(calls.jobLocationCreate.length, 0);
});

test('createJob keeps an object location intact for the jobLocation row', async () => {
  const { prisma, calls } = createMockPrisma();
  const service = new EmployerService(prisma as never, cacheMock as never);

  await service.createJob(employerUser, {
    ...baseBody,
    location: { city: 'San Francisco', region: 'California', country: 'USA' },
  } as never);

  const loc = calls.jobLocationCreate[0];
  assert.equal(loc.city, 'San Francisco');
  assert.equal(loc.country, 'USA');
});

test('getInterviews redacts PRIVATE profiles and never exposes passwordHash', async () => {
  const prisma = {
    application: {
      findMany: async () => [
        {
          id: 'app-1',
          status: 'INTERVIEW',
          createdAt: new Date('2026-09-15T10:00:00.000Z'),
          job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
          student: {
            id: 'stu-3',
            email: 'private@gradture.dev',
            passwordHash: 's3cret',
            avatarUrl: null,
            profile: { id: 'prof-3', name: 'Private Pat', focus: 'Data', visibility: 'PRIVATE' },
          },
          interview: { id: 'int-1' },
        },
      ],
      count: async () => 1,
    },
  };
  const service = new EmployerService(prisma as never, cacheMock as never);

  const result = await service.getInterviews({ id: 'emp-1', role: 'EMPLOYER' } as never, { page: 1, limit: 20 });

  assert.equal(result.items.length, 1);
  const item = result.items[0] as Record<string, unknown>;
  assert.equal(item.candidate, 'Candidate', 'PRIVATE candidate name/email must not be shown');
});

test('getInterviews shows the candidate name for a public/employers-only profile', async () => {
  const prisma = {
    application: {
      findMany: async () => [
        {
          id: 'app-2',
          status: 'INTERVIEW',
          createdAt: new Date('2026-09-15T10:00:00.000Z'),
          job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
          student: {
            id: 'stu-4',
            email: 'open@gradture.dev',
            passwordHash: 's3cret',
            avatarUrl: null,
            profile: { id: 'prof-4', name: 'Open Ollie', focus: 'Data', visibility: 'PUBLIC' },
          },
          interview: { id: 'int-2' },
        },
      ],
      count: async () => 1,
    },
  };
  const service = new EmployerService(prisma as never, cacheMock as never);

  const result = await service.getInterviews({ id: 'emp-1', role: 'EMPLOYER' } as never, { page: 1, limit: 20 });

  const item = result.items[0] as Record<string, unknown>;
  assert.equal(item.candidate, 'Open Ollie');
});