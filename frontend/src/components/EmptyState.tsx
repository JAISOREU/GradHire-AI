type EmptyStateProps = {
  icon?: string;
  title: string;
  text?: string;
};

export const EmptyState = ({ icon = '🔍', title, text }: EmptyStateProps) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">{icon}</div>
    <div className="empty-state__title">{title}</div>
    {text && <p className="empty-state__text">{text}</p>}
  </div>
);

