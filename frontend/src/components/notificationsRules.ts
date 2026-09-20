import type { Notification, Interview } from '../core/types';

const TITLE_MAP: Record<string, string> = {
  APPLICATION: 'Application update',
  INTERVIEW: 'Interview scheduled',
  MESSAGE: 'New message',
};

const ICON_MAP: Record<string, string> = {
  APPLICATION: 'Briefcase',
  INTERVIEW: 'Calendar',
  MESSAGE: 'ChatCircle',
  GENERIC: 'Bell',
};

const TAB_KEY_MAP: Record<string, string> = {
  APPLICATION: 'applications',
  INTERVIEW: 'interviews',
  MESSAGE: 'messages',
};

export const NOTIFICATION_TABS = [
  { key: 'all', label: 'All' },
  { key: 'applications', label: 'Applications' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'messages', label: 'Messages' },
] as const;

export const allNotificationTypes = ['APPLICATION', 'INTERVIEW', 'MESSAGE', 'GENERIC'] as const;

export const notificationTitle = (n: Notification): string =>
  TITLE_MAP[n.type ?? ''] ?? 'Notification';

export const notificationIcon = (n: Notification): string =>
  ICON_MAP[n.type ?? ''] ?? 'Bell';

export const notificationTabKey = (n: Notification): string =>
  TAB_KEY_MAP[n.type ?? ''] ?? 'all';

export interface UpcomingItem {
  id: string;
  company: string;
  title: string;
  when: string;
}

export const formatWhen = (iso: string): string => {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
};

const DEADLINE_WINDOW_DAYS = 14;

export const upcomingInterviewsFrom = (interviews: Interview[], now = new Date()): UpcomingItem[] =>
  interviews
    .filter((i) => i.status === 'SCHEDULED' && new Date(i.scheduledAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((i) => ({
      id: i.id,
      company: i.application?.job?.company ?? 'Unknown',
      title: i.application?.job?.title ?? 'Interview',
      when: formatWhen(i.scheduledAt),
    }));

export const closingDeadlines = (
  entries: { id: string; title?: string; company?: string; applicationDeadline?: string }[],
  now = new Date(),
): UpcomingItem[] => {
  const cutoff = now.getTime() + DEADLINE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return entries
    .filter((e) => {
      if (!e.applicationDeadline) return false;
      const t = new Date(e.applicationDeadline).getTime();
      return t >= now.getTime() && t <= cutoff;
    })
    .sort((a, b) => new Date(a.applicationDeadline as string).getTime() - new Date(b.applicationDeadline as string).getTime())
    .map((e) => ({
      id: e.id,
      company: e.company ?? 'Unknown',
      title: e.title ?? '',
      when: formatWhen(e.applicationDeadline as string),
    }));
};
