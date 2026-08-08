import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { studentsApi } from '../../core/api/endpoints/students';
import { KPICard } from '../../components/KPICard';
import { DashboardSection } from '../../components/DashboardSection';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { data: jobs, loading: jobsLoading } = useAsync(() => jobsApi.list(''), []);
  const { data: profile } = useAsync(() => studentsApi.getProfile(), []);
  const { data: applications, loading: appsLoading } = useAsync(() => studentsApi.listApplications(), []);

  const appCount = applications?.length ?? 0;
  const profileComplete = profile?.focus ? Math.min(100, Math.round((profile.focus.split(' ').filter(Boolean).length / 5) * 100)) : 0;
  const matchCount = jobs?.length ?? 0;

  return (
    <div className="page fade-in pc-density">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Your job search at a glance."
      />

      <div className="status-strip status-strip--4 section--mt">
        <KPICard
          label="Applications"
          value={appCount}
          icon="📨"
          trend={{ direction: appCount > 0 ? 'up' : 'neutral', value: `${appCount} sent`, label: 'total' }}
          action={
            <Link to="/student/applications"><Button variant="ghost" size="sm">View all</Button></Link>
          }
        />
        <KPICard
          label="Profile"
          value={`${profileComplete}%`}
          icon="🎯"
          trend={{ direction: profileComplete >= 80 ? 'up' : 'neutral', value: profileComplete >= 80 ? 'Strong' : 'In progress', label: 'completion' }}
          action={
            <Link to="/student/profile"><Button variant="ghost" size="sm">Update</Button></Link>
          }
        />
        <KPICard
          label="AI Matches"
          value={matchCount}
          icon="✨"
          trend={{ direction: 'up', value: `${matchCount} new`, label: 'today' }}
          action={
            <Link to="/student/recommended"><Button variant="ghost" size="sm">Explore</Button></Link>
          }
        />
        <KPICard
          label="Saved Jobs"
          value="0"
          icon="🔖"
          trend={{ direction: 'neutral', value: '0 active', label: 'saved' }}
          action={
            <Link to="/student/saved"><Button variant="ghost" size="sm">Browse</Button></Link>
          }
        />
      </div>

      <DashboardSection
        title="Recent applications"
        subtitle="Track the status of roles you've applied to."
        action={
          <Link to="/student/applications"><Button variant="ghost" size="sm">View all →</Button></Link>
        }
        className="section--mt"
      >
        {appsLoading ? (
          <Skeleton variant="table" lines={4} />
        ) : applications && applications.length > 0 ? (
          applications.slice(0, 5).map((app) => (
            <div key={app.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{app.job?.title ?? 'Unknown'} <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>at {app.job?.company ?? 'Unknown'}</span></h3>
                  <div className="list-item__meta">
                    <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon="📨" title="No applications yet" text="Apply to jobs to track them here." action={<Link to="/jobs"><Button size="sm">Browse jobs</Button></Link>} />
        )}
      </DashboardSection>

      <DashboardSection
        title="Top matches for you"
        subtitle="AI-ranked roles based on your profile."
        action={
          <Link to="/jobs"><Button variant="ghost" size="sm">View all →</Button></Link>
        }
        className="section--mt"
      >
        {jobsLoading ? (
          <Skeleton variant="table" lines={3} />
        ) : jobs && jobs.length > 0 ? (
          jobs.slice(0, 3).map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{job.title}</h3>
                  <div className="list-item__meta">
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                  </div>
                </div>
                <div className="match-score" style={{ minWidth: 120 }} role="progressbar" aria-valuenow={Math.min(job.matchScore, 100)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${Math.min(job.matchScore, 100)}% match`} aria-label={`Match score ${job.matchScore}%`}>
                  <div className="match-score__top"><span>Match</span><strong>{Math.min(job.matchScore, 100)}%</strong></div>
                  <div className="match-score__track"><div className="match-score__fill" style={{ width: `${Math.min(job.matchScore, 100)}%` }} /></div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState icon="💼" title="No matches yet" text="Complete your profile to see AI-matched jobs." action={<Link to="/student/profile"><Button size="sm">Update profile</Button></Link>} />
        )}
      </DashboardSection>
    </div>
  );
};
