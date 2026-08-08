import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  hover?: boolean;
  className?: string;
  children: ReactNode;
};

export const Card = ({ title, subtitle, action, hover = false, className = '', children }: CardProps) => {
  const classes = `card ${hover ? 'card--hover' : ''} ${className}`.trim();
  return (
    <div className={classes}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: title ? '0.75rem' : '0' }}>
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

