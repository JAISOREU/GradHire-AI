import type { ReactNode } from 'react';

export type BadgeKind = 'hiring' | 'internship' | 'applied' | 'withdrawn' | 'open' | 'closed' | 'archived' | 'warning';

type BadgeProps = {
  kind: BadgeKind;
  children: ReactNode;
};

const KIND_LABELS: Record<BadgeKind, string> = {
  hiring: 'Hiring',
  internship: 'Internship',
  applied: 'Applied',
  withdrawn: 'Withdrawn',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
  warning: 'Warning',
};

/** Resolve a badge kind from a raw status/type string. */
export const resolveBadgeKind = (value?: string): BadgeKind => {
  const v = value?.toLowerCase() ?? '';
  if (v.includes('intern')) return 'internship';
  if (v.includes('withdraw')) return 'withdrawn';
  if (v.includes('applied')) return 'applied';
  if (v.includes('closed')) return 'closed';
  if (v.includes('archiv')) return 'archived';
  if (v.includes('hire') || v.includes('hiring')) return 'hiring';
  return 'open';
};

export const Badge = ({ kind, children }: BadgeProps) => (
  <span className={`badge badge--${kind}`}>{children ?? KIND_LABELS[kind]}</span>
);

