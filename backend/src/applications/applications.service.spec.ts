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
      findMany: async () => applications,
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

  return { prisma, applications, notifications, emailEvents };
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
