import type { ReactNode } from 'react';
import { PhosphorIcon, type PhosphorIconName } from './PhosphorIcon';

type EmptyStateProps = {
  icon?: PhosphorIconName;
  title: string;
  text?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  illustration?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, text, action, secondaryAction, illustration, className = '' }: EmptyStateProps) => (
  <div className={`empty-state ${className}`.trim()}>
    {icon && (
      <div className="empty-state__icon" aria-hidden="true">
        <PhosphorIcon name={icon} size={28} weight="duotone" />
      </div>
    )}
    {illustration && <div className="empty-state__illustration" aria-hidden="true">{illustration}</div>}
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