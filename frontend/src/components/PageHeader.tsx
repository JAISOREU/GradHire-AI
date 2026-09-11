import type { ReactNode } from 'react';

type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
};

export const PageHeader = ({ title, subtitle, action, actions, breadcrumbs }: PageHeaderProps) => (
  <div className="section-header">
    <div>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-text-secondary" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {crumb.href ? (
                <a href={crumb.href} className="transition-colors hover:text-text">{crumb.label}</a>
              ) : (
                <span className="font-medium text-text">{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <span aria-hidden="true">/</span>}
            </span>
          ))}
        </nav>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {action ? action : actions}
  </div>
);