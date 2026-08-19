import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminApplicationsPage = () => {
  const { data, loading, reload } = useAsync(() => adminApi.applications(), []);

  const applications = data?.items ?? [];

  const handleStatusChange = async (applicationId: string, status: string) => {
    try {
      await adminApi.updateApplication(applicationId, { status });
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Applications</h1>
      <AdminListPage
        items={applications}
        renderItem={(a) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{a.job?.title}</h3>
                <div className="list-item__meta">
                  <span>{a.student?.email}</span>
                  <span>{a.job?.company}</span>
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select className="select" value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="📨"
        emptyTitle="No applications"
        emptyText="No applications found."
      />
    </div>
  );
};
