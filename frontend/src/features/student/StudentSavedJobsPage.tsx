import { useAsync } from '../../core/hooks/useAsync';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import { Badge, resolveBadgeKind } from '../../components/Badge';

export const StudentSavedJobsPage = () => {
  const { data: saved, loading } = useAsync(() => savedJobsApi.listMine<{ id: string; job: { id: string; title: string; company: string; location: string; type: string }; savedAt: string }>(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">Saved jobs</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Bookmark roles you want to revisit.</p>

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : saved && saved.length > 0 ? (
          <div className="list">
            {saved.map((item) => (
              <Link key={item.id} to={`/jobs/${item.job.id}`} className="list-item card--hover" style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{item.job.title}</h3>
                    <div className="list-item__meta">
                      <span>{item.job.company}</span>
                      <span>{item.job.location}</span>
                      <Badge kind={resolveBadgeKind(item.job.type)}>{item.job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.35rem' }}>
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
