import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type BentoGridProps = {
  columns?: 2 | 3 | 4;
  gap?: string;
  className?: string;
  children: ReactNode;
};

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const BentoGrid = ({ columns = 4, className, children }: BentoGridProps) => (
  <div className={cn('grid gap-4', COL_CLASSES[columns], className)} style={{ gap: 'var(--bento-gap, 16px)' }}>
    {children}
  </div>
);

type BentoItemProps = {
  span?: 1 | 2 | 3 | 4;
  className?: string;
  children: ReactNode;
};

const SPAN_CLASSES: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

export const BentoItem = ({ span = 1, className, children }: BentoItemProps) => (
  <div data-bento-item className={cn(SPAN_CLASSES[span], className)}>
    {children}
  </div>
);
