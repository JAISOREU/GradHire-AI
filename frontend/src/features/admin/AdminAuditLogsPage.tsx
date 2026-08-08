import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminAuditLogsPage = () => {
  const { data: logs, loading } = useAsync(() => adminApi.auditLogs(), []);

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Audit Logs</h1>
      <AdminListPage
        items={logs ?? []}
        renderItem={(log) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title" style={{ fontSize: '1rem', fontWeight: 600 }}>{log.action}</h3>
                <div className="list-item__meta">
                  <span>{log.user?.email}</span>
                  <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="📋"
        emptyTitle="No audit logs"
        emptyText="No audit logs found."
      />
    </div>
  );
};
