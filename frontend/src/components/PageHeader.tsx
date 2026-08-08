import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
};

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="section-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="card__subtitle card__subtitle--mt">{subtitle}</p>}
    </div>
    {action}
  </div>
);
