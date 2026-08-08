import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminApplicationsPage = () => {
  const { data, loading } = useAsync(() => adminApi.applications(), []);

  const applications = data?.items ?? [];

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
                  <span>{a.status}</span>
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
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



