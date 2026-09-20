import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { ApplicationsService } from './applications.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

// Minimal mock of PrismaService that satisfies the methods used by ApplicationsService.
function createMockPrisma() {
  const applications: Array<Record<string, unknown>> = [];
  const notifications: Array<Record<string, unknown>> = [];
  const emailEvents: Array<Record<string, unknown>> = [];
  const findManyArgs: Array<Record<string, unknown>> = [];
  const jobs: Array<Record<string, unknown>> = [
    { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI', employerId: 'emp-1', status: 'PUBLISHED' },
  ];

  const prisma = {
    job: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        jobs.find((j) => j.id === where.id) ?? null,
    },
    application: {
      findUnique: async ({ where }: { where: { id?: string; studentId_jobId?: { studentId: string; jobId: string } } }) => {
        if (where.studentId_jobId) {
          return (
            applications.find(
              (a) => a.studentId === where.studentId_jobId!.studentId && a.jobId === where.studentId_jobId!.jobId,
            ) ?? null
          );
        }
        return applications.find((a) => a.id === where.id) ?? null;
      },
      create: async ({ data, include }: { data: Record<string, unknown>; include?: Record<string, boolean> }) => {
        const app: Record<string, unknown> = { id: `app-${applications.length + 1}`, ...data };
        if (include?.job) {
          const job = jobs.find((j) => j.id === data.jobId) as Record<string, unknown> | undefined;
          if (job) {
            app.job = { ...job };
          }
        }
        if (include?.statusHistory) {
          app.statusHistory = [];
        }
        if (include?.events) {
          app.events = [];
        }
        applications.push(app);
        return app;
      },
      findMany: async (args: Record<string, unknown>) => {
        findManyArgs.push(args);
        return applications;
      },
      count: async ({ where }: { where?: { studentId?: string } }) =>
        applications.filter((a) => a.studentId === where?.studentId).length,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = applications.findIndex((a) => a.id === where.id);
        if (idx === -1) throw new Error('not found');
        applications[idx] = { ...applications[idx], ...data };
        return applications[idx];
      },
    },
    notification: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const n = { id: `notif-${notifications.length + 1}`, ...data };
        notifications.push(n);
        return n;
      },
    },
    emailEvent: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const e = { id: `email-${emailEvents.length + 1}`, ...data };
        emailEvents.push(e);
        return e;
      },
    },
    user: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === 'emp-1' ? { id: 'emp-1', email: 'employer@gradture.dev' } : null,
    },
  };

  return { prisma, applications, notifications, emailEvents, findManyArgs };
}

const createMockEmail = () => ({
  send: async () => ({ id: 'mock-email', status: 'SENT' }),
}) as unknown as EmailService;

const createMockNotifications = () => ({
  create: async () => ({ id: 'mock-notif', message: '', read: false, createdAt: new Date() }),
}) as unknown as NotificationsService;

const student = { id: 'stu-1', email: 'ava@gradture.dev', role: 'STUDENT' };
const employer = { id: 'emp-1', email: 'employer@gradture.dev', role: 'EMPLOYER' };

test('apply creates an application, notification and email event', async () => {
  const { prisma, applications, emailEvents } = createMockPrisma();
  const notifications = { calls: [] as Array<{ recipientId: string; message: string; applicationId: string }> };
  const mockNotifications = {
    create: async (recipientId: string, message: string, applicationId?: string) => {
      notifications.calls.push({ recipientId, message, applicationId: applicationId ?? '' });
      return { id: 'mock-notif', message, read: false, createdAt: new Date() };
    },
  } as unknown as NotificationsService;

  const service = new ApplicationsService(prisma as never, createMockEmail(), mockNotifications);

  const result = await service.apply(student as never, 'job-1', {});

  assert.equal(result.status, 'SUBMITTED');
  assert.equal(applications.length, 1);
  assert.equal(notifications.calls.length, 1);
  assert.equal(notifications.calls[0].recipientId, 'emp-1');
  assert.equal(emailEvents.length, 1);
  assert.equal(emailEvents[0].status, 'SENT');
});

test('apply rejects duplicate applications', async () => {
  const { prisma } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  await service.apply(student as never, 'job-1', {});
  await assert.rejects(() => service.apply(student as never, 'job-1', {}), BadRequestException);
});

test('apply requires STUDENT role', async () => {
  const { prisma } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  await assert.rejects(() => service.apply(employer as never, 'job-1', {}), ForbiddenException);
});

test('apply throws NotFound when job is missing', async () => {
  const { prisma } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  await assert.rejects(() => service.apply(student as never, 'missing-job', {}), NotFoundException);
});

test('withdraw only allows the owning student', async () => {
  const { prisma } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  const created = await service.apply(student as never, 'job-1', {});
  await assert.rejects(
    () => service.withdraw({ ...student, id: 'other-student' } as never, created.id as string),
    ForbiddenException,
  );
});

test('hasApplied reports true only for an existing student/job application', async () => {
  const { prisma, applications } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  assert.equal((await service.hasApplied(student as never, 'job-1')).applied, false);

  await service.apply(student as never, 'job-1', {});
  assert.equal(applications.length, 1);

  assert.equal((await service.hasApplied(student as never, 'job-1')).applied, true);
  assert.equal((await service.hasApplied({ ...student, id: 'other-student' } as never, 'job-1')).applied, false);
  assert.equal((await service.hasApplied(student as never, 'job-999')).applied, false);
});

test('hasApplied requires STUDENT role', async () => {
  const { prisma } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  await assert.rejects(() => service.hasApplied(employer as never, 'job-1'), ForbiddenException);
});

test('getMyApplications exposes submittedAt and career interview on list items', async () => {
  const { prisma, applications } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  const appliedAt = new Date('2026-09-10T08:00:00.000Z');
  const updatedAt = new Date('2026-09-11T08:00:00.000Z');
  applications.push({
    id: 'app-9',
    studentId: 'stu-1',
    jobId: 'job-1',
    status: 'INTERVIEW',
    createdAt: appliedAt,
    lastStatusChangeAt: updatedAt,
    job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
    statusHistory: [{ id: 'sh-1', newStatus: 'INTERVIEW', createdAt: updatedAt }],
    interview: { id: 'int-1', status: 'SCHEDULED', scheduledAt: new Date('2026-09-20T14:00:00.000Z') },
  });

  const result = await service.getMyApplications(student as never);
  assert.equal(result.items.length, 1);

  const item = result.items[0] as Record<string, unknown>;
  assert.equal(item.id, 'app-9');
  assert.equal(item.status, 'INTERVIEW');
  assert.equal(item.submittedAt, appliedAt);
  assert.equal(item.lastStatusChangeAt, updatedAt);
  assert.ok(item.interview);
  assert.equal((item.interview as { id: string }).id, 'int-1');
  assert.equal((item.interview as { scheduledAt: Date }).scheduledAt.toISOString(), '2026-09-20T14:00:00.000Z');
});

test('getMyApplications selects employerId on jobs so clients can find shared applications', async () => {
  const { prisma, applications, findManyArgs } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  applications.push({
    id: 'app-10',
    studentId: 'stu-1',
    jobId: 'job-1',
    status: 'SUBMITTED',
    createdAt: new Date('2026-09-10T08:00:00.000Z'),
    lastStatusChangeAt: new Date('2026-09-10T08:00:00.000Z'),
    job: { id: 'job-1', employerId: 'emp-1', title: 'Data Analyst', company: 'Cedar AI' },
    statusHistory: [{ id: 'sh-2', newStatus: 'SUBMITTED', createdAt: new Date('2026-09-10T08:00:00.000Z') }],
    interview: null,
  });

  await service.getMyApplications(student as never);
  const myQuery = findManyArgs[0] as { include?: { job?: { select?: Record<string, boolean> } } };
  assert.ok(myQuery.include?.job?.select, 'expected a job select on getMyApplications');
  assert.equal(myQuery.include.job.select.employerId, true);
});

test('listForEmployer never exposes the student passwordHash or resetToken', async () => {
  const { prisma, applications } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  applications.push({
    id: 'app-11',
    studentId: 'stu-9',
    jobId: 'job-1',
    status: 'SUBMITTED',
    submittedAt: new Date('2026-09-12T08:00:00.000Z'),
    viewedAt: null,
    student: {
      id: 'stu-9',
      email: 'priv@gradture.dev',
      passwordHash: 's3cret-hash',
      resetToken: 'reset-token',
      avatarUrl: null,
      profile: { id: 'prof-9', name: 'Private Ava', focus: 'Data', skills: ['SQL'], visibility: 'EMPLOYERS_ONLY' },
    },
    job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
    statusHistory: [],
    interview: null,
  });

  const result = await service.listForEmployer(employer as never, { page: 1, limit: 20 });
  const item = result.items[0] as Record<string, unknown>;
  const student = item.student as Record<string, unknown>;

  assert.equal(student.passwordHash, undefined, 'passwordHash must not be exposed to employers');
  assert.equal(student.resetToken, undefined, 'resetToken must not be exposed to employers');
  assert.equal((student.profile as { name: string }).name, 'Private Ava', 'visible profile preserved');
});

test('listForEmployer redacts the profile when the student visibility is PRIVATE', async () => {
  const { prisma, applications } = createMockPrisma();
  const service = new ApplicationsService(prisma as never, createMockEmail(), createMockNotifications());

  applications.push({
    id: 'app-12',
    studentId: 'stu-8',
    jobId: 'job-1',
    status: 'SUBMITTED',
    submittedAt: new Date('2026-09-12T08:00:00.000Z'),
    viewedAt: null,
    student: {
      id: 'stu-8',
      email: 'hidden@gradture.dev',
      passwordHash: 's3cret-hash',
      avatarUrl: null,
      profile: { id: 'prof-8', name: 'Hidden Hana', focus: 'Eng', skills: ['TS'], visibility: 'PRIVATE' },
    },
    job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
    statusHistory: [],
    interview: null,
  });

  const result = await service.listForEmployer(employer as never, { page: 1, limit: 20 });
  const item = result.items[0] as Record<string, unknown>;
  const student = item.student as Record<string, unknown>;

  assert.equal(student.profile, null, 'PRIVATE profile must be redacted for employers');
  assert.equal(student.id, 'stu-8');
});
