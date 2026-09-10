import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import type { PhosphorIconName } from './PhosphorIcon';

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  numeric?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  items: T[];
  keyExtractor: (item: T) => string;
  emptyIcon?: PhosphorIconName;
  emptyTitle?: string;
  emptyText?: string;
  loading?: boolean;
  skeletonLines?: number;
  actions?: (item: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  items,
  keyExtractor,
  emptyIcon = 'Tray' as PhosphorIconName,
  emptyTitle = 'No data',
  emptyText = 'No items found.',
  loading = false,
  skeletonLines = 5,
  actions,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="data-table-wrapper">
        <div className="data-table">
          <div className="data-table__head">
            {columns.map((col) => (
              <div key={col.key} className={`data-table__th ${col.className ?? ''}`}>{col.header}</div>
            ))}
            {actions && <div className="data-table__th data-table__th--actions" />}
          </div>
          <div className="data-table__body">
            {Array.from({ length: skeletonLines }).map((_, i) => (
              <div key={i} className="data-table__row">
                {columns.map((col) => (
                  <div key={col.key} className={`data-table__td ${col.className ?? ''}`}>
                    <Skeleton variant="text" lines={1} />
                  </div>
                ))}
                {actions && <div className="data-table__td data-table__td--actions" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} text={emptyText} />;
  }

  const cellClass = (col: Column<T>) =>
    [col.className ?? '', col.numeric ? 'data-table__td--num' : ''].filter(Boolean).join(' ');

  return (
    <div className="data-table-wrapper">
      <div className="data-table">
        <div className="data-table__head">
          {columns.map((col) => (
            <div key={col.key} className={`data-table__th ${cellClass(col)}`}>{col.header}</div>
          ))}
          {actions && <div className="data-table__th data-table__th--actions" />}
        </div>
        <div className="data-table__body">
          {items.map((item) => (
            <div key={keyExtractor(item)} className="data-table__row">
              {columns.map((col) => (
                <div key={col.key} className={`data-table__td ${cellClass(col)}`}>
                  {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key]?.toString() ?? ''}
                </div>
              ))}
              {actions && <div className="data-table__td data-table__td--actions">{actions(item)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
