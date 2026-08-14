import { useAsync } from '../../core/hooks/useAsync';
import { aggregationApi } from '../../core/api/endpoints/aggregation';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';

export const AdminJobAggregationJobsPage = () => {
  const page = 1;
  const { data, loading, reload } = useAsync(() => aggregationApi.jobs(page, 20), [page]);
  const jobs = data?.items ?? [];

  const handleApprove = async (id: string) => {
    await aggregationApi.approveJob(id);
    reload();
  };

  const handleReject = async (id: string) => {
    await aggregationApi.rejectJob(id);
    reload();
  };

  const handleRetry = async (id: string) => {
    await aggregationApi.retryJob(id);
    reload();
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Aggregated Jobs" subtitle="Review and moderate discovered jobs." />
      {loading ? (
        <LoadingState label="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState icon="💼" title="No aggregated jobs" text="Discovered jobs will appear here." />
      ) : (
        <AdminListPage
          items={jobs}
          renderItem={(job: any) => (
            <div className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title card__title">{job.title}</h3>
                  <div className="list-item__meta">
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <span>{job.sourceName}</span>
                    <span className="badge badge--info">{job.status}</span>
                    {job.confidence !== null && (
                      <span className="badge badge--warning">{Math.round(job.confidence * 100)}% confidence</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {job.status === 'PENDING_REVIEW' && (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(job.id)}>Approve</Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(job.id)}>Reject</Button>
                    </>
                  )}
                  {job.status === 'REJECTED' && (
                    <Button variant="secondary" size="sm" onClick={() => handleRetry(job.id)}>Retry</Button>
                  )}
                  <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">View Original</Button>
                  </a>
                </div>
              </div>
            </div>
          )}
          loading={loading}
          emptyIcon="💼"
          emptyTitle="No aggregated jobs"
          emptyText="Discovered jobs will appear here."
        />
      )}
    </div>
  );
};
