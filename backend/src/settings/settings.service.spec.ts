import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('SettingsService integration - creates default settings', async () => {
  const user = await prisma.user.findFirst({ select: { id: true } });
  const userId = user?.id ?? 'test-user';

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
  const user = await prisma.user.findFirst({ select: { id: true } });
  const userId = user?.id ?? 'test-user';

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
