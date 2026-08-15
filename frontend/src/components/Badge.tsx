import type { ReactNode } from 'react';
import { Icon } from './Icon';

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
  <span className={`badge badge--${kind}`} role="status">
    <span className="badge__icon" aria-hidden="true">
      {icon || <Icon name={KIND_ICONS[kind] as any} size={12} />}
    </span>
    <span>{children ?? KIND_LABELS[kind]}</span>
  </span>
);

