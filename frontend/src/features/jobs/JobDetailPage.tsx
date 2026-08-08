import { useParams, Link } from 'react-router-dom';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { useAsync } from '../../core/hooks/useAsync';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { useAuth } from '../../core/auth/AuthContext';
import { roleHomePath } from '../../core/utils/navigation';

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { data: job, loading } = useAsync(() => jobsApi.getById(id ?? ''), [id]);

  if (loading) return <LoadingState label="Loading job…" />;
  if (!job) return <EmptyState icon="🔍" title="Job not found" text="This job may no longer be available." />;

  return (
    <div className="page fade-in">
      <Link to="/jobs" className="back-link">← Back to jobs</Link>
      <div className="card section--mt">
        <h1 className="page-title">{job.title}</h1>
        <div className="list-item__meta">
          <span>{job.company}</span>
          <span>{job.location}</span>
          <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
        </div>

        <div className="match-score section--mt" role="progressbar" aria-valuenow={Math.min(job.matchScore, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Match score ${job.matchScore}%`}>
          <div className="match-score__top">
            <span>Match score</span>
            <strong>{job.matchScore}%</strong>
          </div>
          <div className="match-score__track">
            <div className="match-score__fill" style={{ width: `${Math.min(job.matchScore, 100)}%` }} />
          </div>
        </div>

        {job.description && (
          <p className="card__subtitle section--mt" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        )}

        <div className="section--mt">
          {isAuthenticated && user ? (
            <Link to={roleHomePath(user.role)}>
              <Button>Apply in dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Sign in to apply</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
