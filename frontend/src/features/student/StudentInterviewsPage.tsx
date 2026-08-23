import { useAsync } from '../../core/hooks/useAsync';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { useState } from 'react';
import type { Interview, PaginatedResponse } from '../../core/types';

const PAGE_SIZE = 10;

export const StudentInterviewsPage = () => {
  const [page, setPage] = useState(1);
  const { data: interviews, loading, error, reload } = useAsync(
    () => interviewsApi.getMyInterviews(page, PAGE_SIZE),
    [page],
  );

  const items = (interviews as PaginatedResponse<Interview> | undefined)?.items ?? [];
  const total = (interviews as PaginatedResponse<Interview> | undefined)?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page fade-in">
      <PageHeader title="My interviews" subtitle="View your scheduled interviews." />

      {error && (
        <div className="message message--error" role="alert">
          {error ?? 'Failed to load interviews.'} <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading interviews…" />
        ) : items.length > 0 ? (
          <>
            <div className="list">
              {items.map((inv: Interview) => (
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
                    <Tooltip content="Join the interview meeting">
                      <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm section--mt" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Join meeting
                      </a>
                    </Tooltip>
                  )}
                  {inv.notes && <p className="text-sm text-secondary section--mt">Notes: {inv.notes}</p>}
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between section--mt" style={{ gap: 'var(--space-2)' }}>
              <span className="text-sm text-secondary">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon="🗓️" title="No interviews scheduled" text="When employers schedule interviews, they will appear here." />
        )}
      </div>
    </div>
  );
};
