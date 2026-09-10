import { Fragment } from 'react';
import { PhosphorIcon, type PhosphorIconName } from './PhosphorIcon';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

type AdminListPageProps<T> = {
  title?: string;
  icon?: PhosphorIconName;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loading: boolean;
  emptyIcon?: PhosphorIconName;
  emptyTitle: string;
  emptyText: string;
};

export const AdminListPage = <T,>({
  title,
  icon,
  items,
  renderItem,
  loading,
  emptyIcon = 'Tray',
  emptyTitle,
  emptyText,
}: AdminListPageProps<T>) => {
  if (loading) {
    return (
      <div className="list-container">
        <Skeleton variant="table" lines={5} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="list-container">
        <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} />
      </div>
    );
  }

  return (
    <div className="list-container">
      {title && (
        <div className="list-container__header">
          {icon && (
            <span className="list-container__icon" aria-hidden="true">
              <PhosphorIcon name={icon} size={20} weight="duotone" />
            </span>
          )}
          <h2 className="page-title">{title}</h2>
        </div>
      )}
      <div className="list">
        {items.map((item, index) => (
          <Fragment key={index}>{renderItem(item, index)}</Fragment>
        ))}
      </div>
    </div>
  );
};
