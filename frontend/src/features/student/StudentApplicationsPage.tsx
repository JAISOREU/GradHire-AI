import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { useToast } from '../../core/toast/ToastContext';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { useState } from 'react';

export const StudentApplicationsPage = () => {
  const { data: applications, loading, error, reload } = useAsync(() => studentsApi.listApplications(), []);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState('');
  const { addToast } = useToast();

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    setWithdrawingId(applicationId);
    setWithdrawError('');

    try {
      await studentsApi.withdraw(applicationId);
      addToast('success', 'Application withdrawn');
      reload();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Failed to withdraw application. Please try again.');
      addToast('error', err instanceof Error ? err.message : 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="My applications" subtitle="Track the status of every role you&apos;ve applied to." />

      {error && (
        <div className="message message--error" role="alert">
          {(error as any)?.message ?? 'Failed to load applications.'} <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : applications && applications.length > 0 ? (
          <div className="list">
            {withdrawError && <div className="message message--error" role="alert">{withdrawError}</div>}
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
                    <Tooltip content="Withdraw your application for this role">
                      <Button variant="ghost" size="sm" onClick={() => handleWithdraw(app.id)} disabled={withdrawingId === app.id}>
                        {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw'}
                      </Button>
                    </Tooltip>
                  )}
                </div>
                {(app as any).lastEvent && (
                   <div className="text-sm text-secondary section--mt border-l-2 border-border pl-4">
                    <strong>{(app as any).lastEvent.newStatus}</strong> — {(app as any).lastEvent.message || 'Status updated'}
                     <div className="text-xs text-muted">{new Date((app as any).lastEvent.createdAt).toLocaleString()}</div>
                  </div>
                )}
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
