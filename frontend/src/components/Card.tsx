import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  hover?: boolean;
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

export const Card = ({ title, subtitle, action, hover = false, loading = false, className = '', children }: CardProps) => {
  const classes = `card ${hover ? 'card--hover' : ''} ${className}`.trim();
  if (loading) {
    return (
      <div className={classes}>
        <div className="skeleton-card__title" />
        <div className="skeleton-card__body" style={{ width: '80%' }} />
        <div className="skeleton-card__body" style={{ width: '60%' }} />
      </div>
    );
  }
  return (
    <div className={classes}>
      {(title || action) && (
        <div className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

