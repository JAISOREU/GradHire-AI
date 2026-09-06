import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, text, action, secondaryAction, className = '' }: EmptyStateProps) => (
  <div className={`empty-state ${className}`.trim()}>
    {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
    <div className="empty-state__title">{title}</div>
    {text && <p className="empty-state__text">{text}</p>}
    {(action || secondaryAction) && (
      <div className="empty-state__actions">
        {action && <div className="empty-state__action">{action}</div>}
        {secondaryAction && <div className="empty-state__secondary-action">{secondaryAction}</div>}
      </div>
    )}
  </div>
);
