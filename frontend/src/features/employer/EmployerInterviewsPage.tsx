import { useAsync } from '../../core/hooks/useAsync';
import { employersApi } from '../../core/api/endpoints/employers';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerInterviewsPage = () => {
  const { data: interviews, loading } = useAsync(() => employersApi.listInterviews(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">Interview scheduling</h1>
      <p className="card__subtitle card__subtitle--mt">Manage interviews with your candidates.</p>

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading interviews…" />
        ) : interviews && interviews.length > 0 ? (
          interviews.map((inv) => (
            <article key={inv.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="card__title">{inv.candidate}</h3>
                  <div className="list-item__meta">
                    <span>{inv.job.title}</span>
                    <span>{new Date(inv.scheduledAt).toLocaleString()}</span>
                    <span>{inv.status}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState icon="🗓️" title="No interviews scheduled" text="When you schedule interviews, they'll appear here." />
        )}
      </div>
    </div>
  );
};




