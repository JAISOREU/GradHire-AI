import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type BadgeKind = 'hiring' | 'applied' | 'withdrawn' | 'open' | 'closed' | 'archived' | 'muted';

type BadgeProps = {
  kind: BadgeKind;
  children: ReactNode;
  pulse?: boolean;
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
  if (v.includes('withdraw')) return 'withdrawn';
  if (v.includes('reject')) return 'closed';
  if (v.includes('hire') || v.includes('offer')) return 'hiring';
  if (v.includes('shortlist') || v.includes('interview')) return 'hiring';
  if (v.includes('intern')) return 'applied';
  if (v.includes('applied') || v.includes('submitted') || v.includes('assessment')) return 'applied';
  if (v.includes('review')) return 'muted';
  if (v.includes('closed')) return 'closed';
  if (v.includes('archiv')) return 'archived';
  if (v.includes('pause') || v.includes('expired')) return 'muted';
  if (v.includes('open') || v.includes('live') || v.includes('publish') || v.includes('active')) return 'hiring';
  return 'open';
};

export const Badge = ({ kind, children, pulse = false }: BadgeProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', KIND_STYLES[kind])} role="status">
    {pulse && <span className="mr-1.5 h-2 w-2 rounded-full bg-current animate-pulse" aria-hidden="true" />}
    {children ?? KIND_LABELS[kind]}
  </span>
);

