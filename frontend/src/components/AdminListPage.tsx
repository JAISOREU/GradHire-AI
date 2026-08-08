import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

type AdminListPageProps<T> = {
  title?: string;
  icon?: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading: boolean;
  emptyIcon?: string;
  emptyTitle: string;
  emptyText: string;
};

export const AdminListPage = <T,>({
  title,
  icon,
  items,
  renderItem,
  loading,
  emptyIcon = '📭',
  emptyTitle,
  emptyText,
}: AdminListPageProps<T>) => {
  if (loading) {
    return (
      <div className="list-container" style={{ marginTop: '1rem' }}>
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="list-container" style={{ marginTop: '1rem' }}>
        <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} />
      </div>
    );
  }

  return (
    <div className="list-container" style={{ marginTop: '1rem' }}>
      {title && (
        <div style={{ marginBottom: '0.75rem' }}>
          {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
          <h2 className="page-title">{title}</h2>
        </div>
      )}
      <div className="list">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
};
