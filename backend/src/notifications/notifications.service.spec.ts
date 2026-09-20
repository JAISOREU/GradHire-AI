import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { NotificationsService } from './notifications.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

function createMockPrisma() {
  const notifications: Array<Record<string, unknown>> = [];

  const prisma = {
    notification: {
      findMany: async ({ where, include, skip, take }: { where: { recipientId: string; read?: boolean; type?: string }; include?: unknown; skip?: number; take?: number }) => {
        let filtered = notifications
          .filter((n) => n.recipientId === where.recipientId)
          .filter((n) => (where.read === undefined ? true : n.read === where.read))
          .filter((n) => (where.type === undefined ? true : n.type === where.type));
        if (skip !== undefined) filtered = filtered.slice(skip);
        if (take !== undefined) filtered = filtered.slice(0, take);
        return filtered.map((n) => ({ ...n, application: n.application ?? null }));
      },
      findUnique: async ({ where }: { where: { id: string } }) =>
        notifications.find((n) => n.id === where.id) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = notifications.findIndex((n) => n.id === where.id);
        if (idx === -1) throw new Error('not found');
        notifications[idx] = { ...notifications[idx], ...data };
        return notifications[idx];
      },
      updateMany: async ({ where, data }: { where: { recipientId: string; read?: boolean }; data: Record<string, unknown> }) => {
        let count = 0;
        for (const n of notifications) {
          if (n.recipientId !== where.recipientId) continue;
          if (where.read !== undefined && n.read !== where.read) continue;
          Object.assign(n, data);
          count++;
        }
        return { count };
      },
      count: async ({ where }: { where: { recipientId: string; read?: boolean } }) => {
        return notifications.filter((n) => n.recipientId === where.recipientId)
          .filter((n) => (where.read === undefined ? true : n.read === where.read)).length;
      },
    },
  };

  return { prisma, notifications };
}

function createMockGateway() {
  return {
    server: {
      to: () => ({
        emit: () => {},
      }),
    },
  };
}

const user = { id: 'emp-1', email: 'employer@gradture.dev', role: 'EMPLOYER' };

test('listForUser returns only unread notifications by default', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push(
    { id: 'n-1', recipientId: 'emp-1', message: 'New application', read: false, application: null },
    { id: 'n-2', recipientId: 'emp-1', message: 'Old notification', read: true, application: null },
    { id: 'n-3', recipientId: 'other', message: 'Someone else', read: false, application: null },
  );

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.listForUser(user as never);

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, 'n-1');
  assert.equal(result.items[0].job, null);
});

test('listForUser includes read notifications when includeRead=true', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push(
    { id: 'n-1', recipientId: 'emp-1', message: 'New', read: false, application: null },
    { id: 'n-2', recipientId: 'emp-1', message: 'Old', read: true, application: null },
  );

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.listForUser(user as never, true);

  assert.equal(result.items.length, 2);
});

test('markRead updates the read flag', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push({ id: 'n-1', recipientId: 'emp-1', message: 'New', read: false, application: null });

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.markRead(user as never, 'n-1');

  assert.equal(result.read, true);
});

test('markRead throws NotFound for missing notification', async () => {
  const { prisma } = createMockPrisma();
  const service = new NotificationsService(prisma as never, createMockGateway() as never);

  await assert.rejects(() => service.markRead(user as never, 'missing'), NotFoundException);
});

test('markRead throws Forbidden when notification belongs to another user', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push({ id: 'n-1', recipientId: 'other', message: 'New', read: false, application: null });

  const service = new NotificationsService(prisma as never, createMockGateway() as never);

  await assert.rejects(() => service.markRead(user as never, 'n-1'), ForbiddenException);
});

test('listForUser includes type field in items', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push(
    { id: 'n-1', recipientId: 'emp-1', message: 'New app', read: false, type: 'APPLICATION', application: { job: { id: 'j-1', title: 'Dev', company: 'Acme' } } },
  );

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.listForUser(user as never);

  assert.equal(result.items[0].type, 'APPLICATION');
  assert.deepEqual(result.items[0].job, { id: 'j-1', title: 'Dev', company: 'Acme' });
});

test('listForUser filters by type when type is provided', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push(
    { id: 'n-1', recipientId: 'emp-1', message: 'App', read: false, type: 'APPLICATION', application: null },
    { id: 'n-2', recipientId: 'emp-1', message: 'Msg', read: false, type: 'MESSAGE', application: null },
    { id: 'n-3', recipientId: 'emp-1', message: 'Interview', read: false, type: 'INTERVIEW', application: null },
  );

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.listForUser(user as never, false, undefined, 'APPLICATION');

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].type, 'APPLICATION');
});

test('markAllRead marks all user notifications as read', async () => {
  const { prisma, notifications } = createMockPrisma();
  notifications.push(
    { id: 'n-1', recipientId: 'emp-1', message: 'One', read: false, type: 'APPLICATION', application: null },
    { id: 'n-2', recipientId: 'emp-1', message: 'Two', read: false, type: 'MESSAGE', application: null },
    { id: 'n-3', recipientId: 'other', message: 'Other', read: false, type: 'GENERIC', application: null },
  );

  const service = new NotificationsService(prisma as never, createMockGateway() as never);
  const result = await service.markAllRead(user as never);

  assert.equal(result.updated, 2);
  assert.equal(notifications[0].read, true);
  assert.equal(notifications[1].read, true);
  assert.equal(notifications[2].read, false);
});

