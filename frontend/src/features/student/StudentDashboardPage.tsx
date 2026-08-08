import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { studentsApi } from '../../core/api/endpoints/students';
import { StatCard } from '../../components/StatCard';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { MorphingText } from '../../components/MorphingText';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { data: jobs, loading: jobsLoading } = useAsync(() => jobsApi.list(''), []);
  const { data: profile } = useAsync(() => studentsApi.getProfile(), []);

  return (
    <div className="page fade-in pc-density">
      <MorphingText text={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋`} as="h1" className="page-title" />
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>
        Here&apos;s what&apos;s happening with your job search.
      </p>

      <div className="status-strip aurora-bg" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="Featured jobs" value={jobs?.length ?? 0} icon="💼" />
        <StatCard label="Profile focus" value={profile?.focus?.split(' ').slice(0, 3).join(' ') ?? '—'} icon="🎯" hint="Micro summary" />
        <StatCard label="AI recommendations" value="Live" icon="✨" />
      </div>

      <section className="section" style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ marginBottom: 0 }}>Top matches</h2>
          <Link to="/jobs"><Button variant="ghost" size="sm">View all →</Button></Link>
        </div>
        <div className="list-container">
          {jobsLoading ? (
            <Skeleton variant="table" lines={4} />
          ) : jobs && jobs.length > 0 ? (
            <div className="list">
              {jobs.slice(0, 3).map((job, index) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className={`list-item card--hover mask-reveal mask-reveal--delay-${index + 1}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <div className="list-item__head">
                    <div>
                      <h3 className="list-item__title">{job.title}</h3>
                      <div className="list-item__meta">
                        <span>{job.company}</span>
                        <span>{job.location}</span>
                        <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="match-score" role="progressbar" aria-valuenow={job.matchScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Match score ${job.matchScore}%`}>
                    <div className="match-score__top"><span>Match score</span><strong>{job.matchScore}%</strong></div>
                    <div className="match-score__track"><div className="match-score__fill" style={{ width: `${job.matchScore}%` }} /></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="💼" title="No matches yet" text="Complete your profile to see AI-matched jobs." />
          )}
        </div>
      </section>
    </div>
  );
};
