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
import { Alert } from '../../components/Alert';
import { PageHeader } from '../../components/PageHeader';
import { ScrollReveal, AnimatedCounter } from '../../animations';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import type { AiRecommendation } from '../../core/types';

const KPI_STAGGER = 80;
const SECTION_STAGGER = 100;

export const StudentDashboardPage = () => {
  const { user } = useAuth();
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
    <div className="page fade-in pc-density">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        subtitle="Your job search at a glance."
      />

      <ScrollReveal options={{ threshold: 0.2, once: true, duration: '800ms', distance: '12px', direction: 'up' }}>
        <div className="status-strip section--mt">
          {(jobsError || appsError || profileError) && (
            <Alert>Some dashboard data failed to load. Please refresh the page.</Alert>
          )}
          <KPICard
            label="Applications"
            value={<AnimatedCounter to={appCount} duration={1000} delay={0} />}

            trend={{ direction: appCount > 0 ? 'up' : 'neutral', value: `${appCount} total`, label: 'applications' }}
            action={
              <Link to="/student/applications"><Button variant="ghost" size="sm">View all</Button></Link>
            }
          />
          <KPICard
            label="Profile"
            value={<AnimatedCounter to={profileCompletePct} duration={1000} delay={KPI_STAGGER} format={(v) => `${Math.round(v)}%`} />}

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
            label="Saved Jobs"
            value={<AnimatedCounter to={savedCount} duration={1000} delay={KPI_STAGGER * 2} />}

            trend={{ direction: 'neutral', value: `${savedCount} active`, label: 'saved' }}
            action={
              <Link to="/student/saved"><Button variant="ghost" size="sm">Browse</Button></Link>
            }
          />
        </div>
      </ScrollReveal>

      <ScrollReveal options={{ threshold: 0.2, once: true, duration: '800ms', distance: '12px', direction: 'up', delay: SECTION_STAGGER }}>
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
      </ScrollReveal>

      <ScrollReveal options={{ threshold: 0.2, once: true, duration: '800ms', distance: '12px', direction: 'up', delay: SECTION_STAGGER * 2 }}>
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
            recommendations.slice(0, 3).map((job: AiRecommendation) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{job.title}</h3>
                    <div className="list-item__meta">
                      <span>{job.company || 'Not specified'}</span>
                      <span>{job.location || 'Remote'}</span>
                      <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : job.type?.toLowerCase().replace('_', ' ') ?? 'Hiring'}</Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))
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
      </ScrollReveal>
    </div>
  );
};
