import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
};

export const EmptyState = ({ icon = '🔍', title, text, action }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">{icon}</div>
    <div className="empty-state__title">{title}</div>
    {text && <p className="empty-state__text">{text}</p>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);

