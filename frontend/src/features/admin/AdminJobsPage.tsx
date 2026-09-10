import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';

export const AdminJobsPage = () => {
  const { data, loading, reload } = useAsync(() => adminApi.jobs(), []);

  const jobs = data?.items ?? [];

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await adminApi.updateJob(jobId, { status });
      reload();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await adminApi.deleteJob(jobId);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Jobs</h1>
      <AdminListPage
        items={jobs}
        renderItem={(j) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{j.title}</h3>
                <div className="list-item__meta">
                  <span>{j.company}</span>
                  <span>{new Date(j.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select className="select" value={j.status} onChange={(e) => handleStatusChange(j.id, e.target.value)}>
                  <option value="PENDING">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <Button variant="danger" size="sm" onClick={() => handleDelete(j.id)}>Delete</Button>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="FolderOpen"
        emptyTitle="No jobs"
        emptyText="No jobs found."
      />
    </div>
  );
};
