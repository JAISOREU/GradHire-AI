import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type SpatialCardProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export const SpatialCard = ({ className, children, onClick }: SpatialCardProps) => (
  <div
    onClick={onClick}
    className={cn(
      'rounded-xl border border-border bg-surface p-5',
      onClick && 'cursor-pointer hover:bg-surface-muted',
      className
    )}
  >
    {children}
  </div>
);