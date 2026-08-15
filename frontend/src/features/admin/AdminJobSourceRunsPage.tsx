import { useParams } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { jobSourcesApi } from '../../core/api/endpoints/jobSources';
import { AdminListPage } from '../../components/AdminListPage';

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  RUNNING: '#3b82f6',
  SUCCESS: '#22c55e',
  PARTIAL: '#f59e0b',
  FAILED: '#ef4444',
};

export const AdminJobSourceRunsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading } = useAsync(() => jobSourcesApi.getRuns(id!), [id]);

  const runs = data ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Ingestion Runs</h1>
      <p style={{ marginBottom: '1rem', color: '#666' }}>Source ID: {id}</p>

      <AdminListPage
        items={runs}
        loading={loading}
        emptyIcon="🔄"
        emptyTitle="No runs"
        emptyText="No ingestion runs found for this source."
        renderItem={(run: any) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">Run {run.id.slice(-8)}</h3>
                <div className="list-item__meta">
                  <span style={{ color: statusColors[run.status] || '#888' }}>{run.status}</span>
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
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fef2f2', borderRadius: '0.25rem', fontSize: '0.85rem' }}>
                <strong>Errors:</strong> {JSON.stringify(run.errors)}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};
