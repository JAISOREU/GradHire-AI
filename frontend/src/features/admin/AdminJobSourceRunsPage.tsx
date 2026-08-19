import { useParams } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { jobSourcesApi } from '../../core/api/endpoints/jobSources';
import { AdminListPage } from '../../components/AdminListPage';
import { EmptyState } from '../../components/EmptyState';

const statusColors: Record<string, string> = {
  PENDING: 'status-pending',
  RUNNING: 'status-running',
  SUCCESS: 'status-success',
  PARTIAL: 'status-partial',
  FAILED: 'status-failed',
};

export const AdminJobSourceRunsPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="page fade-in">
        <h1 className="page-title page-title--admin">Ingestion Runs</h1>
        <EmptyState icon="⚠️" title="Missing source" text="No source ID was provided." />
      </div>
    );
  }

  const { data, loading } = useAsync(() => jobSourcesApi.getRuns(id), [id]);

  const runs = data ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Ingestion Runs</h1>
      <p className="text-secondary text-sm" style={{ marginBottom: '1rem' }}>Source ID: {id}</p>

      <AdminListPage
        items={runs}
        loading={loading}
        emptyIcon="🔄"
        emptyTitle="No runs"
        emptyText="No ingestion runs found for this source."
        renderItem={(run) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">Run {run.id.slice(-8)}</h3>
                <div className="list-item__meta">
                   <span className={statusColors[run.status] || 'status-never-tested'}>{run.status}</span>
                  <span>Discovered: {run.discovered}</span>
                  <span>Imported: {run.imported}</span>
                  <span>Updated: {run.updated}</span>
                  <span>Rejected: {run.rejected}</span>
                  {run.startedAt && <span>Started: {new Date(run.startedAt).toLocaleString()}</span>}
                  {run.finishedAt && <span>Finished: {new Date(run.finishedAt).toLocaleString()}</span>}
                </div>
              </div>
            </div>
             {run.errors && Object.keys(run.errors).length > 0 && (
              <div className="message message--error" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <strong>Errors:</strong> {JSON.stringify(run.errors)}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
