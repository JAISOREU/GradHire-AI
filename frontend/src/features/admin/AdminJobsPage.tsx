import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminJobsPage = () => {
  const { data, loading } = useAsync(() => adminApi.jobs(), []);

  const jobs = data?.items ?? [];

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Jobs</h1>
      <AdminListPage
        items={jobs}
        renderItem={(j) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title" style={{ fontSize: '1rem', fontWeight: 600 }}>{j.title}</h3>
                <div className="list-item__meta">
                  <span>{j.company}</span>
                  <span>{j.status}</span>
                  <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="🗂️"
        emptyTitle="No jobs"
        emptyText="No jobs found."
      />
    </div>
  );
};
