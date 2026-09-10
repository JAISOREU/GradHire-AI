import { Link } from 'react-router-dom';
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
import { Alert } from '../../components/Alert';
import { PageHeader } from '../../components/PageHeader';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { currentPeriodLabel } from '../../core/utils/format';
import { MatchResultCard } from './MatchResultCard';

export const StudentDashboardPage = () => {
  const { data: _jobs, loading: _jobsLoading, error: jobsError } = useAsync(() => jobsApi.list(''), []);
  const { data: _profile, error: profileError } = useAsync(() => studentsApi.getProfile(), []);
  const { data: applications, loading: appsLoading, error: appsError } = useAsync(() => studentsApi.listApplications(), []);
  const { data: savedJobs } = useAsync(() => savedJobsApi.listMine<{ id: string }>(), []);
  const { data: recommendationResult, loading: aiLoading } = useAsync(() => recommendationsApi.ai(6), []);
  const { data: aiReadiness } = useAsync(() => studentsApi.getAiReadiness(), []);
  const { data: completeness } = useAsync(() => studentsApi.getProfileCompleteness(), []);

  const appCount = applications?.length ?? 0;
  const savedCount = savedJobs?.length ?? 0;
  const profileCompletePct = completeness?.percentage ?? 0;
  const hasRecommendationAccess = aiReadiness?.ready ?? false;
  const recommendations = recommendationResult?.recommendations ?? [];

  const missingSectionLinks: Record<string, { to: string; label: string }> = {
    education: { to: '/student/account#section-education', label: 'Add education' },
    skills: { to: '/student/account#section-skills', label: 'Add skills' },
    experience: { to: '/student/account#section-experience', label: 'Add experience' },
    resume: { to: '/student/resume', label: 'Upload resume' },
    career_preferences: { to: '/student/settings', label: 'Set preferences' },
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Job search overview"
        subtitle={`Applications, matches, and saved jobs \u00b7 ${currentPeriodLabel()}`}
      />

      <div className="status-strip status-strip--hero section--mt">
          {(jobsError || appsError || profileError) && (
            <Alert>Some dashboard data failed to load. Please refresh the page.</Alert>
          )}
          <KPICard
            className="kpi-card--primary"
            label="Applications"
            value={appCount}

            trend={{ direction: appCount > 0 ? 'up' : 'neutral', value: `${appCount} total`, label: 'applications' }}
            action={
              <Link to="/student/applications"><Button variant="ghost" size="sm">View all</Button></Link>
            }
          />
          <KPICard
            label="Profile"
            value={`${Math.round(profileCompletePct)}%`}

            trend={{ direction: profileCompletePct >= 80 ? 'up' : 'neutral', value: profileCompletePct >= 80 ? 'Strong' : 'In progress', label: 'completion' }}
            progress={profileCompletePct}
            action={
              <Link to="/student/account"><Button variant="ghost" size="sm">Update</Button></Link>
            }
          />
          <KPICard
            label="Matches"
            value={hasRecommendationAccess ? 'Available' : 'Locked'}

            trend={{ direction: hasRecommendationAccess ? 'up' : 'neutral', value: hasRecommendationAccess ? 'Active' : 'Complete profile', label: 'recommendations' }}
            action={
              <Link to="/student/recommended"><Button variant="ghost" size="sm">Explore</Button></Link>
            }
          />
          <KPICard
            className="kpi-card--wide"
            label="Saved Jobs"
            value={savedCount}

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
            <Link to="/student/applications"><Button variant="ghost" size="sm" iconRight={<PhosphorIcon name="ArrowRight" size={14} />}>View all</Button></Link>
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
                   <h3 className="list-item__title">
                    {app.job?.title || app.job?.company ? `${app.job?.title ?? 'Unknown'} at ${app.job?.company ?? 'Unknown'}` : 'Untitled application'}
                  </h3>
                  <div className="list-item__meta">
                    <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon="EnvelopeOpen" title="No applications yet" text="Start applying to jobs and track your progress here." action={<Link to="/jobs"><Button size="sm">Browse jobs</Button></Link>} />
        )}
        </DashboardSection>

      <DashboardSection
          title={hasRecommendationAccess ? "Top matches for you" : "Unlock recommendations"}
          subtitle={hasRecommendationAccess ? "Ranked roles based on your profile." : "Complete your education, skills, and experience to unlock personalized job matches."}
          action={
            <Link to={hasRecommendationAccess ? "/jobs" : "/student/account"}><Button variant="ghost" size="sm" iconRight={<PhosphorIcon name="ArrowRight" size={14} />}>{hasRecommendationAccess ? 'View all' : 'Complete profile'}</Button></Link>
          }
          className="section--mt"
        >
        {hasRecommendationAccess ? (
          aiLoading ? (
            <Skeleton variant="table" lines={3} />
          ) : recommendations.length > 0 ? (
            <div className="list">
              {recommendations.slice(0, 3).map((job) => (
                <MatchResultCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState icon="Briefcase" title="No matches yet" text="Complete your profile to see matched jobs." action={<Link to="/student/account"><Button size="sm">Update profile</Button></Link>} />
          )
        ) : (
          <div className="auth-locked-recommendations">
            <div className="auth-locked-recommendations__body">
              <h3 className="auth-locked-recommendations__title">Complete your profile</h3>
              <p className="auth-locked-recommendations__text">Add your education, skills, and experience to unlock personalized job matches.</p>
            </div>
            <div className="auth-locked-recommendations__actions">
              {(aiReadiness?.missing ?? []).map((key: string) => {
                const link = missingSectionLinks[key];
                if (!link) return null;
                return (
                  <Link key={key} to={link.to} className="no-underline">
                    <Button variant="secondary" size="sm">{link.label}</Button>
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
