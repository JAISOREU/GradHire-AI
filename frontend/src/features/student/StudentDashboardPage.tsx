import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { studentsApi } from '../../core/api/endpoints/students';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { KPICard } from '../../components/KPICard';
import { DashboardSection } from '../../components/DashboardSection';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import type { AiRecommendation } from '../../core/types';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const { data: _jobs, loading: jobsLoading, error: jobsError } = useAsync(() => jobsApi.list(''), []);
  const { data: profile, error: profileError } = useAsync(() => studentsApi.getProfile(), []);
  const { data: applications, loading: appsLoading, error: appsError } = useAsync(() => studentsApi.listApplications(), []);
  const { data: savedJobs } = useAsync(() => savedJobsApi.listMine<{ id: string }>(), []);
  const { data: recommendationResult } = useAsync(() => recommendationsApi.ai(6), []);
  const { data: aiReadiness } = useAsync(() => studentsApi.getAiReadiness(), []);

  const appCount = applications?.length ?? 0;
  const savedCount = savedJobs?.length ?? 0;
  const focusWords = profile?.focus ? profile.focus.split(' ').filter(Boolean).length : 0;
  const profileCompletePct = Math.min(100, Math.round((focusWords / 5) * 100));
  const hasRecommendationAccess = aiReadiness?.ready ?? false;
  const recommendations = recommendationResult?.recommendations ?? [];

  const missingSectionLinks: Record<string, { to: string; label: string }> = {
    education: { to: '/student/account', label: 'Add education' },
    skills: { to: '/student/account', label: 'Add skills' },
    experience: { to: '/student/account', label: 'Add experience' },
    resume: { to: '/student/resume', label: 'Upload resume' },
    career_preferences: { to: '/student/settings', label: 'Set preferences' },
  };

  return (
    <div className="page fade-in pc-density">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Your job search at a glance."
      />

      <div className="status-strip status-strip--4 section--mt">
        {(jobsError || appsError || profileError) && (
          <div className="message message--error" role="alert">
            Some dashboard data failed to load. Please refresh the page.
          </div>
        )}
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
          value={`${profileCompletePct}%`}
          icon="🎯"
          trend={{ direction: profileCompletePct >= 80 ? 'up' : 'neutral', value: profileCompletePct >= 80 ? 'Strong' : 'In progress', label: 'completion' }}
          action={
            <Link to="/student/account"><Button variant="ghost" size="sm">Update</Button></Link>
          }
        />
        <KPICard
          label="AI Matches"
          value={hasRecommendationAccess ? 'Available' : 'Locked'}
          icon="✨"
          trend={{ direction: hasRecommendationAccess ? 'up' : 'neutral', value: hasRecommendationAccess ? 'Active' : 'Complete profile', label: 'recommendations' }}
          action={
            <Link to="/student/recommended"><Button variant="ghost" size="sm">Explore</Button></Link>
          }
        />
        <KPICard
          label="Saved Jobs"
          value={savedCount}
          icon="🔖"
          trend={{ direction: 'neutral', value: `${savedCount} active`, label: 'saved' }}
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
                   <h3 className="list-item__title">{app.job?.title ?? 'Unknown'} <span className="text-muted">at {app.job?.company ?? 'Unknown'}</span></h3>
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
        title={hasRecommendationAccess ? "Top matches for you" : "Unlock AI recommendations"}
        subtitle={hasRecommendationAccess ? "AI-ranked roles based on your profile." : "Complete your education, skills, and experience to unlock personalized job matches."}
        action={
          <Link to={hasRecommendationAccess ? "/jobs" : "/student/account"}><Button variant="ghost" size="sm">{hasRecommendationAccess ? 'View all →' : 'Complete profile'}</Button></Link>
        }
        className="section--mt"
      >
        {hasRecommendationAccess ? (
          jobsLoading ? (
            <Skeleton variant="table" lines={3} />
          ) : recommendations.length > 0 ? (
            recommendations.slice(0, 3).map((job: AiRecommendation) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{job.title}</h3>
                    <div className="list-item__meta">
                      <span>{job.company || 'Not specified'}</span>
                      <span>{job.location || 'Remote'}</span>
                      <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState icon="💼" title="No matches yet" text="Complete your profile to see AI-matched jobs." action={<Link to="/student/account"><Button size="sm">Update profile</Button></Link>} />
          )
        ) : (
          <div className="card" style={{ padding: '1rem' }}>
            <EmptyState
              icon="🎯"
              title="Complete your profile to receive personalized job recommendations"
              text="Add your education, skills, and experience so we can match you with the right opportunities."
            />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(aiReadiness?.missing ?? []).map((key: string) => {
                const link = missingSectionLinks[key];
                if (!link) return null;
                return (
                  <Link key={key} to={link.to} className="btn btn--secondary btn--sm" style={{ alignSelf: 'flex-start' }}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </DashboardSection>
    </div>
  );
};
