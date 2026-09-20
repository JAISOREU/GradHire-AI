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
      findMany: async ({ where, include }: { where: { OR: Array<{ senderId: string } | { recipientId: string }> }; include?: Record<string, unknown> }) => {
        const or = where.OR as Array<{ senderId: string } | { recipientId: string }>;
        const filtered = messages.filter((m) => or.some((c) => 'senderId' in c ? m.senderId === c.senderId : m.recipientId === c.recipientId));
        if (include?.sender || include?.recipient) {
          return filtered.map((m) => ({
            ...m,
            sender: users.find((u) => u.id === m.senderId),
            recipient: users.find((u) => u.id === m.recipientId),
          }));
        }
        return filtered;
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
      findFirst: async ({ where }: { where: { email: { contains: string; mode: string } } }) => {
        const email = (where.email as { contains: string }).contains.toLowerCase();
        return users.find((u) => (u.email as string).toLowerCase().includes(email)) ?? null;
      },
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

test('listForUser enriches participants with display name, role, title and company', async () => {
  const { prisma, messages, users } = createMockPrisma();
  users.splice(
    0,
    users.length,
    {
      id: 'sender-1',
      email: 'sender@gradture.dev',
      role: 'STUDENT',
      avatarUrl: 'https://x/avatar.png',
      profile: { name: 'Demo Student', focus: 'Software engineering' },
    },
    {
      id: 'recipient-1',
      email: 'recipient@gradture.dev',
      role: 'EMPLOYER',
      avatarUrl: null,
      employerProfile: { companyName: 'Acme Corp', industry: 'Technology', location: 'San Francisco, CA' },
    },
    { id: 'deleted-user', email: 'deleted@gradture.dev', role: 'STUDENT' },
  );
  const service = new MessagesService(prisma as never, createMockGateway() as never, createMockNotifications() as never);

  messages.push({
    id: 'msg-1',
    senderId: 'recipient-1',
    recipientId: 'sender-1',
    body: 'Hi there!',
    createdAt: new Date('2026-09-13T10:00:00.000Z'),
    read: false,
  });

  const result = await service.listForUser(sender as never);
  assert.equal(result.items.length, 1);

  const item = result.items[0] as Record<string, unknown>;
  assert.equal(item.from, 'recipient-1');
  assert.equal(item.fromRole, 'EMPLOYER');
  assert.equal(item.fromName, 'Acme Corp');
  assert.equal(item.fromTitle, 'Technology');
  assert.equal(item.fromCompany, 'Acme Corp');
  assert.equal(item.fromAvatar, null);
  assert.equal(item.to, 'sender-1');
  assert.equal(item.toRole, 'STUDENT');
  assert.equal(item.toName, 'Demo Student');
  assert.equal(item.toTitle, 'Software engineering');
  assert.equal(item.toCompany, null);
  assert.equal(item.toAvatar, 'https://x/avatar.png');
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
