import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { InterviewsService } from './interviews.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

const notifications = {
  create: async () => ({ id: 'n-1', message: '', read: false, createdAt: new Date() }),
} as unknown as NotificationsService;

function makePrisma(interviews: Array<Record<string, unknown>>) {
  return {
    interview: {
      findMany: async () => interviews,
      count: async () => interviews.length,
    },
    job: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === 'job-1' ? { id: 'job-1', employerId: 'emp-1' } : null,
    },
  };
}

const employer = { id: 'emp-1', email: 'emp@gradture.dev', role: 'EMPLOYER' };

function interviewRow(status: 'PRIVATE' | 'PUBLIC'): Record<string, unknown> {
  return {
    id: 'int-1',
    scheduledAt: new Date('2026-09-20T10:00:00.000Z'),
    status: 'SCHEDULED',
    application: {
      id: 'app-1',
      status: 'INTERVIEW',
      student: {
        id: 'stu-9',
        email: 's@gradture.dev',
        passwordHash: 's3cret-hash',
        resetToken: 'reset-token',
        avatarUrl: null,
        profile:
          status === 'PRIVATE'
            ? { id: 'p-9', name: 'Hidden Hana', focus: 'Eng', visibility: 'PRIVATE' }
            : { id: 'p-9', name: 'Public Pal', focus: 'Eng', visibility: 'PUBLIC' },
      },
      job: { id: 'job-1', title: 'Data Analyst', company: 'Cedar AI' },
    },
  };
}

test('getEmployerInterviews never exposes student passwordHash or resetToken', async () => {
  const service = new InterviewsService(makePrisma([interviewRow('PUBLIC')]) as never, notifications);

  const result = await service.getEmployerInterviews(employer as never, { page: 1, limit: 20 });

  const student = (result.items[0] as { application: { student: Record<string, unknown> } }).application.student;
  assert.equal(student.passwordHash, undefined, 'passwordHash must not be exposed');
  assert.equal(student.resetToken, undefined, 'resetToken must not be exposed');
  assert.equal((student.profile as { name: string }).name, 'Public Pal');
});

test('getEmployerInterviews redacts the profile for PRIVATE students', async () => {
  const service = new InterviewsService(makePrisma([interviewRow('PRIVATE')]) as never, notifications);

  const result = await service.getEmployerInterviews(employer as never, { page: 1, limit: 20 });

  const student = (result.items[0] as { application: { student: Record<string, unknown> } }).application.student;
  assert.equal(student.profile, null, 'PRIVATE profile must be redacted');
});

test('getJobInterviews never exposes passwordHash and redacts PRIVATE profiles', async () => {
  const service = new InterviewsService(
    makePrisma([interviewRow('PRIVATE'), interviewRow('PUBLIC')]) as never,
    notifications,
  );

  const result = await service.getJobInterviews(employer as never, 'job-1');

  const students = (result as Array<{ application: { student: Record<string, unknown> } }>).map((i) => i.application.student);
  assert.equal(students[0].passwordHash, undefined);
  assert.equal(students[0].profile, null, 'PRIVATE profile redacted');
  assert.equal((students[1].profile as { name: string }).name, 'Public Pal');
});

test('getJobInterviews forbids employers who do not own the job', async () => {
  const prisma = {
    job: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === 'job-2' ? { id: 'job-2', employerId: 'other-emp' } : null,
    },
  };
  const service = new InterviewsService(prisma as never, notifications);

  await assert.rejects(() => service.getJobInterviews(employer as never, 'job-2'), ForbiddenException);
  await assert.rejects(() => service.getJobInterviews(employer as never, 'missing'), NotFoundException);
});