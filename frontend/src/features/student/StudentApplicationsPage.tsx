import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';

export const StudentApplicationsPage = () => {
  const { data: applications, loading } = useAsync(() => studentsApi.listApplications(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">My applications</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Track the status of every role you&apos;ve applied to.</p>

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : applications && applications.length > 0 ? (
          <div className="list">
            {applications.map((app) => (
              <article key={app.id} className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">
                      {app.job?.title ?? 'Unknown'} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>at {app.job?.company ?? 'Unknown'}</span>
                    </h3>
                    <div className="list-item__meta">
                      <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="📨" title="No applications yet" text="Apply to featured opportunities to track them here." />
        )}
      </div>
    </div>
  );
};
