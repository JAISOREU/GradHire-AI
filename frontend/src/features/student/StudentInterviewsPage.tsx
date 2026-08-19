import { useAsync } from '../../core/hooks/useAsync';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Badge, resolveBadgeKind } from '../../components/Badge';

export const StudentInterviewsPage = () => {
  const { data: interviews, loading, error, reload } = useAsync(() => interviewsApi.getMyInterviews(), []);

  return (
    <div className="page fade-in">
      <PageHeader title="My interviews" subtitle="View your scheduled interviews." />

      {error && (
        <div className="message message--error" role="alert">
          {(error as any)?.message ?? 'Failed to load interviews.'} <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading interviews…" />
        ) : interviews && (interviews as any).items?.length > 0 ? (
          (interviews as any).items.map((inv: any) => (
            <article key={inv.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{inv.application?.job?.title}</h3>
                  <div className="list-item__meta">
                    <span>{inv.application?.job?.company}</span>
                    <span>{new Date(inv.scheduledAt).toLocaleString()}</span>
                    <span>{inv.durationMinutes} min</span>
                    <Badge kind={resolveBadgeKind(inv.status)}>{inv.status}</Badge>
                  </div>
                </div>
              </div>
              {inv.location && <p className="card__subtitle section--mt">Location: {inv.location}</p>}
              {inv.meetingLink && (
                <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm section--mt" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Join meeting
                </a>
              )}
              {inv.notes && <p className="text-sm text-secondary section--mt">Notes: {inv.notes}</p>}
            </article>
          ))
        ) : (
          <EmptyState icon="🗓️" title="No interviews scheduled" text="When employers schedule interviews, they will appear here." />
        )}
      </div>
    </div>
  );
};
