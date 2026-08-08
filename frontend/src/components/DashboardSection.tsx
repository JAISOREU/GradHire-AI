import type { ReactNode } from 'react';

type DashboardSectionProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export const DashboardSection = ({ title, subtitle, action, children, className = '' }: DashboardSectionProps) => (
  <section className={`dashboard-section ${className}`}>
    <div className="dashboard-section__header">
      <div>
        <h2 className="dashboard-section__title">{title}</h2>
        {subtitle && <p className="dashboard-section__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="dashboard-section__action">{action}</div>}
    </div>
    <div className="dashboard-section__content">
      {children}
    </div>
  </section>
);
