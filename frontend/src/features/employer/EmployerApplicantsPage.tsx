import { useAsync } from '../../core/hooks/useAsync';
import { employersApi } from '../../core/api/endpoints/employers';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerApplicantsPage = () => {
  const { data: applicants, loading } = useAsync(() => employersApi.listApplicants(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">Applicants</h1>
      <p className="card__subtitle card__subtitle card__subtitle--mt">Review candidates who applied to your jobs.</p>

      <div className="list" style={{ marginTop: '1.25rem' }}>
        {loading ? (
          <LoadingState label="Loading applicants…" />
        ) : applicants && applicants.length > 0 ? (
          applicants.map((app) => (
            <article key={app.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="card__title">{app.job?.title ?? 'Unknown'}</h3>
                  <div className="list-item__meta">
                    <span>Application</span>
                    <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState icon="👥" title="No applicants yet" text="Applications will appear here as candidates apply." />
        )}
      </div>
    </div>
  );
};




