import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '../lib/utils';

export type BadgeKind = 'hiring' | 'internship' | 'applied' | 'withdrawn' | 'open' | 'closed' | 'archived' | 'external' | 'muted';

type BadgeProps = {
  kind: BadgeKind;
  children: ReactNode;
  icon?: ReactNode;
};

const KIND_LABELS: Record<BadgeKind, string> = {
  hiring: 'Hiring',
  internship: 'Internship',
  applied: 'Applied',
  withdrawn: 'Withdrawn',
  open: 'Open',
  closed: 'Closed',
  archived: 'Archived',
  external: 'External',
  muted: 'Muted',
};

const KIND_ICONS: Record<BadgeKind, string> = {
  hiring: 'check',
  internship: 'star',
  applied: 'mail',
  withdrawn: 'x',
  open: 'check',
  closed: 'x',
  archived: 'archive',
  external: 'external',
  muted: 'help',
};

const KIND_STYLES: Record<BadgeKind, string> = {
  hiring: 'bg-success-soft text-success border-success/20',
  internship: 'bg-warning-soft text-warning border-warning/20',
  applied: 'bg-info-soft text-info border-info/20',
  withdrawn: 'bg-surface-muted text-text-tertiary border-border',
  open: 'bg-success-soft text-success border-success/20',
  closed: 'bg-danger-soft text-danger border-danger/20',
  archived: 'bg-surface-muted text-text-tertiary border-border',
  external: 'bg-info-soft text-info border-info/20',
  muted: 'bg-surface-muted text-text-secondary border-border',
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

export const Badge = ({ kind, children, icon }: BadgeProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', KIND_STYLES[kind])} role="status">
    <span className="flex-shrink-0" aria-hidden="true">
      {icon || <Icon name={KIND_ICONS[kind] as any} size={12} />}
    </span>
    <span>{children ?? KIND_LABELS[kind]}</span>
  </span>
);

