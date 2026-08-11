import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { useState } from 'react';

export const StudentApplicationsPage = () => {
  const { data: applications, loading, error, reload } = useAsync(() => studentsApi.listApplications(), []);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    setWithdrawingId(applicationId);
    try {
      await studentsApi.withdraw(applicationId);
      reload();
    } catch {
      alert('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="My applications" subtitle="Track the status of every role you&apos;ve applied to." />

      {error && (
        <div className="message message--error" role="alert">
          Failed to load applications. <button onClick={reload} className="link">Retry</button>
        </div>
      )}

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
                      {app.job?.title ?? 'Unknown'} <span className="text-muted">at {app.job?.company ?? 'Unknown'}</span>
                    </h3>
                    <div className="list-item__meta">
                      <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                      <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && app.status !== 'HIRED' && (
                    <Button variant="ghost" size="sm" onClick={() => handleWithdraw(app.id)} disabled={withdrawingId === app.id}>
                      {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw'}
                    </Button>
                  )}
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
