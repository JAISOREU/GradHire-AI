import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import { EmptyState } from '../../components/EmptyState';

export const AdminReportsPage = () => {
  const { data: stats } = useAsync(() => adminApi.dashboard(), []);

  type ReportItem = { id: string; label: string; description: string };

  const reports: ReportItem[] = stats ? [
    { id: 'users', label: 'User report', description: `${stats.users} total users (${stats.students} students, ${stats.employers} employers)` },
    { id: 'jobs', label: 'Job report', description: `${stats.activeJobs} active job listings` },
    { id: 'applications', label: 'Application report', description: `${stats.applicationsToday} applications today` },
  ] : [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Reports</h1>
      <p className="card__subtitle card__subtitle--mt">Platform reports and exports.</p>
      <div className="section--mt">
        {stats ? (
          <AdminListPage
            items={reports}
            renderItem={(item) => (
              <div className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title card__title">{item.label}</h3>
                    <div className="list-item__meta">{item.description}</div>
                  </div>
                </div>
              </div>
            )}
            loading={false}
            emptyIcon="📊"
            emptyTitle="No reports"
            emptyText="Reports will appear here."
          />
        ) : (
          <EmptyState icon="📊" title="Loading reports" text="Reports will appear here." />
        )}
      </div>
    </div>
  );
};
