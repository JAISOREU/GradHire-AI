import type { ReactNode } from 'react';
import { Icon } from './Icon';

type EmptyStateProps = {
  icon?: string;
  iconName?: 'search' | 'star' | 'heart' | 'mail' | 'users';
  title: string;
  text?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
};

export const EmptyState = ({ icon = '🔍', iconName, title, text, action, secondaryAction }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">
      {iconName ? <Icon name={iconName} size={32} /> : <span className="empty-state__icon-emoji">{icon}</span>}
    </div>
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

