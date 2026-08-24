import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type CardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  hover?: boolean;
  loading?: boolean;
  compact?: boolean;
  spacious?: boolean;
  className?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  id?: string;
  children: ReactNode;
};

export const Card = ({ title, subtitle, action, hover = false, loading = false, compact = false, spacious = false, className = '', icon, footer, children }: CardProps) => {
  const baseClasses = 'rounded-xl border border-border bg-surface shadow-sm';
  const paddingClasses = compact ? 'p-4' : spacious ? 'p-6' : 'p-5';
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5' : '';

  const classes = cn(baseClasses, paddingClasses, hoverClasses, className);

  if (loading) {
    return (
      <div className={classes}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-muted" />}
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              {subtitle && <div className="h-3 w-48 animate-pulse rounded bg-surface-muted" />}
            </div>
          </div>
          {action && <div className="h-8 w-20 animate-pulse rounded bg-surface-muted" />}
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-surface-muted" />
        </div>
        {footer && <div className="mt-4 h-10 w-full animate-pulse rounded bg-surface-muted" />}
      </div>
    );
  }
  return (
    <div className={classes}>
      {(title || action || icon) && (
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
            <div>
              {title && <h3 className="text-base font-semibold text-text">{title}</h3>}
              {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="mt-4">{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-border">{footer}</div>}
    </div>
  );
};
