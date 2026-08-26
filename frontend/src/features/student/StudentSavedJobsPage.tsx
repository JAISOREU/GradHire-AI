import { useAsync } from '../../core/hooks/useAsync';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { useToast } from '../../core/toast/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { useState } from 'react';

export const StudentSavedJobsPage = () => {
  const { data: saved, loading, error, reload } = useAsync(() => savedJobsApi.listMine<{ id: string; job: { id: string; title: string; company: string; location: string; type: string; companyRef?: { name?: string } | null }; savedAt: string }>(), []);
  const [unsavingIds, setUnsavingIds] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const handleUnsave = async (itemId: string, jobId: string) => {
    setUnsavingIds((prev) => new Set(prev).add(itemId));
    try {
      await savedJobsApi.unsave(jobId);
      addToast('success', 'Job removed from saved');
      reload();
    } catch {
      addToast('error', 'Failed to unsave job');
      setUnsavingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Saved jobs" subtitle="Bookmark roles you want to revisit." />

      {error && (
        <div className="message message--error" role="alert">
          {(error as any)?.message ?? 'Failed to load saved jobs.'} <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : saved && saved.length > 0 ? (
          <div className="list">
            {saved.map((item) => (
               <Link key={item.id} to={`/jobs/${item.job.id}`} className="list-item card--hover link-reset">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{item.job.title}</h3>
                    <div className="list-item__meta">
                      <span>{item.job.company || item.job.companyRef?.name || 'Not specified'}</span>
                      <span>{item.job.location || 'Remote'}</span>
                      <Badge kind={resolveBadgeKind(item.job.type)}>{item.job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                    </div>
                  </div>
                  <Tooltip content="Remove from saved jobs">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleUnsave(item.id, item.job.id); }} disabled={unsavingIds.has(item.id)}>
                      {unsavingIds.has(item.id) ? 'Removing…' : 'Remove'}
                    </Button>
                  </Tooltip>
                </div>
                 <p className="text-muted text-sm section--mt">
                  Saved {new Date(item.savedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="🔖" title="No saved jobs yet" text="Save jobs you like to keep them here." />
        )}
      </div>
    </div>
  );
};
