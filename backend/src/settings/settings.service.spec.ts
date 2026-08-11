import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getOrCreateUser() {
  let user = await prisma.user.findFirst({ select: { id: true } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'test-' + Date.now() + '@example.com', passwordHash: 'test', role: 'STUDENT' },
      select: { id: true },
    });
  }
  return user.id;
}

test('SettingsService integration - creates default settings', async () => {
  const userId = await getOrCreateUser();

  await prisma.settings.deleteMany({ where: { userId } }).catch(() => undefined);

  const settings = await prisma.settings.upsert({
    where: { userId },
    create: { userId, emailNotifications: true, applicationAlerts: true },
    update: {},
  });

  assert.strictEqual(settings.emailNotifications, true);
  assert.strictEqual(settings.applicationAlerts, true);

  await prisma.settings.deleteMany({ where: { userId } }).catch(() => undefined);
});

test('SettingsService integration - updates settings', async () => {
  const userId = await getOrCreateUser();

  await prisma.settings.deleteMany({ where: { userId } }).catch(() => undefined);

  await prisma.settings.create({
    data: { userId, emailNotifications: true, applicationAlerts: true },
  });

  const settings = await prisma.settings.update({
    where: { userId },
    data: { emailNotifications: false, defaultFocus: 'AI Engineering' },
  });

  assert.strictEqual(settings.emailNotifications, false);
  assert.strictEqual(settings.defaultFocus, 'AI Engineering');

  await prisma.settings.deleteMany({ where: { userId } }).catch(() => undefined);
});
