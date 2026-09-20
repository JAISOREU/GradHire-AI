import type { Application, Interview } from '../../core/types';

export type StageBucket = 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER';

export const TERMINAL_STATUSES = ['REJECTED', 'WITHDRAWN'] as const;

const INTERVIEW_FORMAT_OPTS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

const shimInterview = (value: Interview | null | undefined): value is Interview => Boolean(value?.scheduledAt);

export const isTerminal = (status: string | null | undefined): boolean =>
  TERMINAL_STATUSES.includes((status ?? '') as (typeof TERMINAL_STATUSES)[number]);

export const toStageBucket = (status: string | null | undefined): StageBucket => {
  const s = status ?? 'SUBMITTED';
  if (s === 'UNDER_REVIEW' || s === 'SHORTLISTED' || s === 'ASSESSMENT') return 'UNDER_REVIEW';
  if (s === 'INTERVIEW') return 'INTERVIEW';
  if (s === 'OFFER' || s === 'HIRED') return 'OFFER';
  return 'SUBMITTED';
};

export interface ApplicationMetricsCounts {
  total: number;
  underReview: number;
  interviews: number;
  offers: number;
}

export const computeMetrics = (apps: Application[]): ApplicationMetricsCounts => {
  const counts: ApplicationMetricsCounts = { total: 0, underReview: 0, interviews: 0, offers: 0 };
  for (const app of apps) {
    if (isTerminal(app.status)) continue;
    counts.total += 1;
    const bucket = toStageBucket(app.status);
    if (bucket === 'UNDER_REVIEW') counts.underReview += 1;
    else if (bucket === 'INTERVIEW') counts.interviews += 1;
    else if (bucket === 'OFFER') counts.offers += 1;
  }
  return counts;
};

export interface FunnelStage {
  stage: StageBucket;
  label: string;
  count: number;
}

export const computeFunnel = (apps: Application[]): FunnelStage[] => {
  const byBucket: Record<StageBucket, number> = { SUBMITTED: 0, UNDER_REVIEW: 0, INTERVIEW: 0, OFFER: 0 };
  for (const app of apps) {
    if (isTerminal(app.status)) continue;
    byBucket[toStageBucket(app.status)] += 1;
  }
  return [
    { stage: 'SUBMITTED', label: 'Applied', count: byBucket.SUBMITTED },
    { stage: 'UNDER_REVIEW', label: 'Screening', count: byBucket.UNDER_REVIEW },
    { stage: 'INTERVIEW', label: 'Interview', count: byBucket.INTERVIEW },
    { stage: 'OFFER', label: 'Offer', count: byBucket.OFFER },
  ];
};

export const applicationDate = (app: Pick<Application, 'createdAt' | 'submittedAt'>): string =>
  app.submittedAt ?? app.createdAt;

export const countCreatedThisWeek = (apps: Application[], now = new Date()): number => {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return apps.filter((app) => new Date(applicationDate(app)).getTime() >= cutoff).length;
};

const formatInterviewDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', INTERVIEW_FORMAT_OPTS);

export const nextStep = (app: Application): string | null => {
  if (isTerminal(app.status)) return null;
  const company = app.job?.company ?? 'this company';
  switch (app.status) {
    case 'SUBMITTED':
      return `Follow up with ${company} in 3 days`;
    case 'UNDER_REVIEW':
    case 'SHORTLISTED':
    case 'ASSESSMENT':
      return `Check back with ${company} in 3 days`;
    case 'INTERVIEW':
      return shimInterview(app.interview)
        ? `Interview with ${company} on ${formatInterviewDate(app.interview.scheduledAt)}`
        : `Prepare for your ${company} interview`;
    case 'OFFER':
      return `Review the offer from ${company}`;
    case 'HIRED':
      return `Start onboarding at ${company}`;
    default:
      return `Follow up with ${company}`;
  }
};

export const statusLabel = (status: string | null | undefined): string => {
  switch (status) {
    case 'SUBMITTED':
      return 'Applied';
    case 'UNDER_REVIEW':
      return 'Screening';
    case 'SHORTLISTED':
      return 'Shortlisted';
    case 'ASSESSMENT':
      return 'Assessment';
    case 'INTERVIEW':
      return 'Interview';
    case 'OFFER':
      return 'Offer';
    case 'HIRED':
      return 'Hired';
    case 'REJECTED':
      return 'Rejected';
    case 'WITHDRAWN':
      return 'Withdrawn';
    default:
      return 'Applied';
  }
};

export const upcomingInterviews = (apps: Application[], now = new Date()): Application[] =>
  apps
    .filter((app) => shimInterview(app.interview) && app.interview!.status === 'SCHEDULED')
    .filter((app) => new Date(app.interview!.scheduledAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.interview!.scheduledAt).getTime() - new Date(b.interview!.scheduledAt).getTime());

export interface ActivityItem {
  applicationId: string;
  company: string;
  role: string;
  newStatus: string;
  at: string;
}

export const recentActivity = (apps: Application[]): ActivityItem[] => {
  const items: ActivityItem[] = [];
  for (const app of apps) {
    if (!app.lastEvent) continue;
    items.push({
      applicationId: app.id,
      company: app.job?.company ?? 'Unknown',
      role: app.job?.title ?? '',
      newStatus: app.lastEvent.newStatus ?? app.status,
      at: app.lastEvent.createdAt ?? applicationDate(app),
    });
  }
  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return items;
};

export const timeAgo = (iso: string, now = new Date()): string => {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (diffMs < 0) return 'just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export interface NextStepItem {
  applicationId: string;
  company: string;
  text: string;
}

export const recommendedNextSteps = (apps: Application[], limit = 4): NextStepItem[] => {
  const rank: Record<StageBucket, number> = { SUBMITTED: 0, UNDER_REVIEW: 1, INTERVIEW: 2, OFFER: 3 };
  const items: (NextStepItem & { rank: number; at: string })[] = [];
  for (const app of apps) {
    if (isTerminal(app.status)) continue;
    const text = nextStep(app);
    if (text === null) continue;
    items.push({
      applicationId: app.id,
      company: app.job?.company ?? 'Unknown',
      text,
      rank: rank[toStageBucket(app.status)],
      at: app.lastStatusChangeAt ?? applicationDate(app),
    });
  }
  items.sort((a, b) => a.rank - b.rank || new Date(a.at).getTime() - new Date(b.at).getTime());
  return items.slice(0, limit);
};