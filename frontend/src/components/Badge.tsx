import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type BadgeKind = 'hiring' | 'applied' | 'withdrawn' | 'open' | 'closed' | 'archived' | 'muted';

type BadgeProps = {
  kind: BadgeKind;
  children: ReactNode;
};

const KIND_LABELS: Record<BadgeKind, string> = {
  hiring: 'Hiring',
  applied: 'Applied',
  withdrawn: 'Withdrawn',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
  muted: 'Muted',
};

const KIND_STYLES: Record<BadgeKind, string> = {
  hiring: 'bg-success-soft text-success border-success/20',
  applied: 'bg-surface-muted text-text-secondary border-border',
  withdrawn: 'bg-surface-muted text-text-tertiary border-border',
  open: 'bg-success-soft text-success border-success/20',
  closed: 'bg-danger-soft text-danger border-danger/20',
  archived: 'bg-surface-muted text-text-tertiary border-border',
  muted: 'bg-surface-muted text-text-secondary border-border',
};

/** Resolve a badge kind from a raw status/type string. */
export const resolveBadgeKind = (value?: string): BadgeKind => {
  const v = value?.toLowerCase() ?? '';
  if (v.includes('intern')) return 'applied';
  if (v.includes('withdraw')) return 'withdrawn';
  if (v.includes('applied')) return 'applied';
  if (v.includes('closed')) return 'closed';
  if (v.includes('archiv')) return 'archived';
  if (v.includes('hire') || v.includes('hiring')) return 'hiring';
  return 'open';
};

export const Badge = ({ kind, children }: BadgeProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', KIND_STYLES[kind])} role="status">
    {children ?? KIND_LABELS[kind]}
  </span>
);

