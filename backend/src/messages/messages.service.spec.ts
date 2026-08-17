import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { MessagesService } from './messages.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

function createMockPrisma() {
  const messages: Array<Record<string, unknown>> = [];
  const users: Array<Record<string, unknown>> = [
    { id: 'sender-1', email: 'sender@gradture.dev', role: 'STUDENT' },
    { id: 'recipient-1', email: 'recipient@gradture.dev', role: 'EMPLOYER' },
    { id: 'deleted-user', email: 'deleted@gradture.dev', role: 'STUDENT' },
  ];

  const prisma = {
    message: {
      count: async ({ where }: { where: { senderId: string; createdAt?: { gte: Date } } }) => {
        if (!where.createdAt) return 0;
        const gte = where.createdAt.gte;
        return messages.filter((m) => m.senderId === where.senderId && new Date(m.createdAt as string) >= gte).length;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const message = { id: `msg-${messages.length + 1}`, createdAt: new Date(), ...data };
        messages.push(message);
        return message;
      },
      findUnique: async ({ where }: { where: { id: string } }) => messages.find((m) => m.id === where.id) ?? null,
      findMany: async ({ where }: { where: { OR: Array<{ senderId: string } | { recipientId: string }> } }) => {
        const or = where.OR as Array<{ senderId: string } | { recipientId: string }>;
        return messages.filter((m) => or.some((c) => 'senderId' in c ? m.senderId === c.senderId : m.recipientId === c.recipientId));
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = messages.findIndex((m) => m.id === where.id);
        if (idx === -1) throw new Error('not found');
        messages[idx] = { ...messages[idx], ...data };
        return messages[idx];
      },
    },
    user: {
      findUnique: async ({ where }: { where: { id: string } }) => users.find((u) => u.id === where.id) ?? null,
    },
  };

  return { prisma, messages, users };
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

function createMockNotifications() {
  return {
    create: async () => ({ id: 'mock-notif', message: '', read: false, createdAt: new Date() }),
  };
}

const sender = { id: 'sender-1', email: 'sender@gradture.dev', role: 'STUDENT' as const };
const recipient = { id: 'recipient-1', email: 'recipient@gradture.dev', role: 'EMPLOYER' as const };

test('create rejects sending to self', async () => {
  const { prisma } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  await assert.rejects(
    () => service.create(sender.id, sender.id, 'hello'),
    BadRequestException,
  );
});

test('create rejects sending to non-existent recipient', async () => {
  const { prisma } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  await assert.rejects(
    () => service.create(sender.id, 'non-existent', 'hello'),
    NotFoundException,
  );
});

test('create succeeds for valid sender and recipient', async () => {
  const { prisma, messages } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  const result = await service.create(sender.id, recipient.id, 'Hello!');

  assert.equal(messages.length, 1);
  assert.equal(result.from, sender.id);
  assert.equal(result.to, recipient.id);
  assert.equal(result.body, 'Hello!');
});

test('create enforces rate limit per sender', async () => {
  const { prisma } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  for (let i = 0; i < 20; i++) {
    await service.create(sender.id, recipient.id, `msg-${i}`);
  }

  await assert.rejects(
    () => service.create(sender.id, recipient.id, 'spam'),
    BadRequestException,
  );
});

test('listForUser returns only messages involving the user', async () => {
  const { prisma, messages } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  await service.create(sender.id, recipient.id, 'Hello');
  await service.create(recipient.id, sender.id, 'Hi back');
  await service.create('deleted-user', sender.id, 'Ghost');

  const result = await service.listForUser(sender as never);
  assert.equal(result.items.length, 3);
});

test('markRead allows only the recipient', async () => {
  const { prisma, messages } = createMockPrisma();
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  const msg = await service.create(sender.id, recipient.id, 'Hello');
  messages.push(msg as never);

  await assert.rejects(
    () => service.markRead(sender as never, msg.id as string),
    ForbiddenException,
  );

  const result = await service.markRead(recipient as never, msg.id as string);
  assert.equal(result.read, true);
});
