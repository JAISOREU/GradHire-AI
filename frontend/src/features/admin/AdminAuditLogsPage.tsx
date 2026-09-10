import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import type { PaginatedResponse } from '../../core/types';

export const AdminAuditLogsPage = () => {
  const { data: logs, loading } = useAsync(() => adminApi.auditLogs(), []);
  const items = (logs as PaginatedResponse<{ id: string; action: string; user: { email: string }; createdAt: string }> | undefined)?.items ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Audit Logs</h1>
      <AdminListPage
        items={items}
        renderItem={(log) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{log.action}</h3>
                <div className="list-item__meta">
                  <span>{log.user?.email}</span>
                  <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="ClipboardText"
        emptyTitle="No audit logs"
        emptyText="No audit logs found."
      />
    </div>
  );
};



