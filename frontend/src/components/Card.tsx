import type { ReactNode } from 'react';

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
  children: ReactNode;
};

export const Card = ({ title, subtitle, action, hover = false, loading = false, compact = false, spacious = false, className = '', icon, footer, children }: CardProps) => {
  const classes = `card ${compact ? 'card--compact' : ''} ${spacious ? 'card--spacious' : ''} ${hover ? 'card--hover' : ''} ${className}`.trim();
  if (loading) {
    return (
      <div className={classes}>
        <div className="card__header">
          <div className="card__header-text">
            <div className="card__header-left">
              {icon && <div className="card__icon-skeleton" />}
              <div className="card__header-text-content">
                <div className="skeleton-card__title" />
                {subtitle && <div className="skeleton-card__body skeleton-card__body--short" />}
              </div>
            </div>
          </div>
          {action && <div className="skeleton-card__action" />}
        </div>
        <div className="card__body">
          <div className="skeleton-card__body" style={{ width: '90%' }} />
          <div className="skeleton-card__body" style={{ width: '75%' }} />
          <div className="skeleton-card__body" style={{ width: '60%' }} />
        </div>
        {footer && <div className="card__footer-skeleton" />}
      </div>
    );
  }
  return (
    <div className={classes}>
      {(title || action || icon) && (
        <div className="card__header">
          <div className="card__header-text">
            <div className="card__header-left">
              {icon && <span className="card__icon" aria-hidden="true">{icon}</span>}
              <div>
                {title && <h3 className="card__title">{title}</h3>}
                {subtitle && <p className="card__subtitle">{subtitle}</p>}
              </div>
            </div>
          </div>
          {action && <div className="card__action">{action}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
};
