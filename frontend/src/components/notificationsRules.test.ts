import { test, describe } from 'vitest';
import assert from 'node:assert/strict';
import {
  notificationTitle,
  notificationIcon,
  notificationTabKey,
  NOTIFICATION_TABS,
  allNotificationTypes,
  upcomingInterviewsFrom,
  closingDeadlines,
  formatWhen,
} from './notificationsRules';
import type { Notification, Interview } from '../core/types';

const makeNotif = (overrides: Partial<Notification>): Notification => ({
  id: 'n-1',
  message: 'Something happened',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('notificationTitle', () => {
  test('returns Application update for APPLICATION type', () => {
    assert.equal(notificationTitle(makeNotif({ type: 'APPLICATION' })), 'Application update');
  });

  test('returns Interview scheduled for INTERVIEW type', () => {
    assert.equal(notificationTitle(makeNotif({ type: 'INTERVIEW' })), 'Interview scheduled');
  });

  test('returns New message for MESSAGE type', () => {
    assert.equal(notificationTitle(makeNotif({ type: 'MESSAGE' })), 'New message');
  });

  test('returns Notification for GENERIC / unknown type', () => {
    assert.equal(notificationTitle(makeNotif({ type: 'GENERIC' })), 'Notification');
    assert.equal(notificationTitle(makeNotif({ type: undefined })), 'Notification');
    assert.equal(notificationTitle(makeNotif({})), 'Notification');
  });
});

describe('notificationIcon', () => {
  test('APPLICATION -> Briefcase', () => assert.equal(notificationIcon(makeNotif({ type: 'APPLICATION' })), 'Briefcase'));
  test('INTERVIEW -> Calendar', () => assert.equal(notificationIcon(makeNotif({ type: 'INTERVIEW' })), 'Calendar'));
  test('MESSAGE -> ChatCircle', () => assert.equal(notificationIcon(makeNotif({ type: 'MESSAGE' })), 'ChatCircle'));
  test('GENERIC -> Bell', () => assert.equal(notificationIcon(makeNotif({ type: 'GENERIC' })), 'Bell'));
});

describe('notificationTabKey', () => {
  test('APPLICATION -> applications', () => assert.equal(notificationTabKey(makeNotif({ type: 'APPLICATION' })), 'applications'));
  test('INTERVIEW -> interviews', () => assert.equal(notificationTabKey(makeNotif({ type: 'INTERVIEW' })), 'interviews'));
  test('MESSAGE -> messages', () => assert.equal(notificationTabKey(makeNotif({ type: 'MESSAGE' })), 'messages'));
  test('GENERIC -> all', () => assert.equal(notificationTabKey(makeNotif({ type: 'GENERIC' })), 'all'));
  test('undefined -> all', () => assert.equal(notificationTabKey(makeNotif({})), 'all'));
});

describe('NOTIFICATION_TABS', () => {
  test('has 4 tabs with correct keys', () => {
    assert.equal(NOTIFICATION_TABS.length, 4);
    assert.deepEqual(NOTIFICATION_TABS.map((t) => t.key), ['all', 'applications', 'interviews', 'messages']);
  });
});

describe('allNotificationTypes', () => {
  test('contains APPLICATION, INTERVIEW, MESSAGE, GENERIC', () => {
    assert.deepEqual(allNotificationTypes, ['APPLICATION', 'INTERVIEW', 'MESSAGE', 'GENERIC']);
  });
});

const makeInterview = (overrides: Partial<Interview> & { scheduledAt: string }): Interview =>
  ({
    id: 'int-1',
    status: 'SCHEDULED',
    application: { id: 'app-1', job: { id: 'j-1', title: 'Senior Engineer', company: 'Acme', location: 'Remote' }, student: { id: 's-1' } },
    ...overrides,
  }) as never;

describe('upcomingInterviewsFrom', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');

  test('keeps only SCHEDULED future interviews, sorted by start time', () => {
    const interviews = [
      makeInterview({ id: 'later', scheduledAt: '2026-09-20T10:00:00.000Z' }),
      makeInterview({ id: 'soon', scheduledAt: '2026-09-12T10:00:00.000Z' }),
      makeInterview({ id: 'past', scheduledAt: '2026-09-01T10:00:00.000Z' }),
      makeInterview({ id: 'done', scheduledAt: '2026-09-25T10:00:00.000Z', status: 'COMPLETED' }),
    ];
    const items = upcomingInterviewsFrom(interviews, now);
    assert.deepEqual(items.map((i) => i.id), ['soon', 'later']);
  });

  test('maps interview to company, title, and formatted when', () => {
    const items = upcomingInterviewsFrom([makeInterview({ id: 'soon', scheduledAt: '2026-09-12T10:00:00.000Z' })], now);
    assert.equal(items[0].company, 'Acme');
    assert.equal(items[0].title, 'Senior Engineer');
    assert.match(items[0].when, /\d+/);
  });
});

describe('closingDeadlines', () => {
  const now = new Date('2026-09-10T00:00:00.000Z');

  test('keeps future deadlines within 14 days, sorted soonest first', () => {
    const entries = [
      { id: 'a', title: 'Dev', company: 'Acme', applicationDeadline: '2026-09-15T00:00:00.000Z' },
      { id: 'b', title: 'QA', company: 'Globex', applicationDeadline: '2026-09-12T00:00:00.000Z' },
      { id: 'c', title: 'Old', company: 'X', applicationDeadline: '2026-09-05T00:00:00.000Z' },
      { id: 'd', title: 'Far', company: 'Y', applicationDeadline: '2026-09-30T00:00:00.000Z' },
      { id: 'e', title: 'No deadline', company: 'Z' },
    ];
    const items = closingDeadlines(entries, now);
    assert.deepEqual(items.map((i) => i.id), ['b', 'a']);
  });

  test('renders a short date in the when field', () => {
    const items = closingDeadlines([{ id: 'b', title: 'QA', company: 'Globex', applicationDeadline: '2026-09-12T00:00:00.000Z' }], now);
    assert.match(items[0].when, /Sep/);
  });
});

describe('formatWhen', () => {
  test('renders month day and 12-hour time', () => {
    assert.match(formatWhen('2026-09-12T14:30:00.000Z'), /Sep 12/);
    assert.match(formatWhen('2026-09-12T14:30:00.000Z'), /[0-9]:[0-9]{2}/);
  });
});
