import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { NotificationsService } from './notifications.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

function createMockPrisma() {
  const notifications: Array<Record<string, unknown>> = [];

  const prisma = {
    notification: {
      findMany: async ({ where, include, skip, take }: { where: { recipientId: string; read?: boolean }; include?: unknown; skip?: number; take?: number }) => {
        let filtered = notifications
          .filter((n) => n.recipientId === where.recipientId)
          .filter((n) => (where.read === undefined ? true : n.read === where.read));
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

