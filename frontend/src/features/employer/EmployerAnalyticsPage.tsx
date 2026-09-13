import { Link } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { analyticsApi, employersApi } from '../../core/api/endpoints/employers';
import { KPICard } from '../../components/KPICard';
import { DashboardSection } from '../../components/DashboardSection';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Skeleton } from '../../components/Skeleton';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { currentPeriodLabel } from '../../core/utils/format';
import type { Application } from '../../core/types';

const FUNNEL_STAGES = ['Applications', 'Screening', 'Interview', 'Offer', 'Hired'];

type EmployerApplicant = Application & {
  student?: { profile?: { name?: string; skills?: string[] } | null } | null;
};

export const EmployerAnalyticsPage = () => {
  const { data: analytics, loading, error, reload } = useAsync(() => analyticsApi.getSnapshot(), []);
  const { data: applicants, loading: applicantsLoading } = useAsync(() => employersApi.listApplicants(), []);
  const { data: jobs, loading: jobsLoading } = useAsync(() => employersApi.listJobs(), []);

  const recentApplicants = (applicants as EmployerApplicant[] | undefined)?.slice(0, 5) ?? [];
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Hiring performance over the current period · {currentPeriodLabel()}</p>

      {error && (
        <Alert>
          {error ?? 'Failed to load analytics.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      {loading && !analytics ? (
        <LoadingState label="Loading analytics…" />
      ) : analytics ? (
        <>
          <div className="status-strip status-strip--hero section--mt">
            <KPICard
              className="kpi-card--primary"
              label="Active jobs"
              value={analytics.activeJobs ?? 0}
              trend={{ direction: (analytics.activeJobs ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.activeJobs ?? 0} live`, label: 'postings' }}
            />
            <KPICard
              label="Applications today"
              value={analytics.applicationsToday ?? 0}
              trend={{ direction: (analytics.applicationsToday ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.applicationsToday ?? 0} today`, label: 'new' }}
            />
            <KPICard
              label="Profile views"
              value={analytics.views ?? 0}
              trend={{ direction: (analytics.views ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.views ?? 0} total`, label: 'views' }}
            />
            <KPICard
              className="kpi-card--wide"
              label="Pending interviews"
              value={analytics.pendingInterviews ?? 0}
              trend={{ direction: (analytics.pendingInterviews ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.pendingInterviews ?? 0} scheduled`, label: 'pending' }}
            />
          </div>

          <div className="card section--mt">
            <h3 className="card__title">Hiring funnel</h3>
            <p className="card__subtitle">Applications → Screening → Interview → Offer → Hired</p>
            {(analytics.hiringFunnel?.length ?? 0) > 0 && (() => {
              const stages = analytics.hiringFunnel;
              const max = Math.max(...stages);
              return (
                <div className="funnel section--mt" role="group" aria-label="Hiring funnel">
                  {stages.map((value, index) => {
                    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
                    const prev = index > 0 ? stages[index - 1] : null;
                    const conversion = prev != null && prev > 0 ? Math.round((value / prev) * 100) : null;
                    return (
                      <div key={index} className="funnel__row">
                        <div className="funnel__meta">
                          <span className="funnel__label">{FUNNEL_STAGES[index] ?? `Stage ${index + 1}`}</span>
                          <span className="funnel__values">
                            <span className="funnel__value">{value}</span>
                            {conversion !== null && (
                              <span className="funnel__conversion" aria-label="conversion to previous stage">
                                {conversion}%
                              </span>
                            )}
                          </span>
                        </div>
                        <div
                          className="funnel__track"
                          role="progressbar"
                          aria-label={`${FUNNEL_STAGES[index] ?? `Stage ${index + 1}`} ${value}`}
                          aria-valuenow={value}
                          aria-valuemin={0}
                          aria-valuemax={stages[0] > value ? stages[0] : value}
                        >
                          <div className="funnel__bar" style={{ width: `${Math.max(pct, 4)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          <DashboardSection
            title="Recent applicants"
            subtitle="Candidates who recently applied to your jobs."
            action={
              <Link to="/employer/applicants"><Button variant="ghost" size="sm" iconRight={<PhosphorIcon name="ArrowRight" size={14} />}>View all</Button></Link>
            }
            className="section--mt"
          >
            {loading || applicantsLoading ? (
              <Skeleton variant="table" lines={4} />
            ) : recentApplicants.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Job</th>
                      <th>Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplicants.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar src={undefined} name={app.student?.profile?.name} size="sm" />
                            <span className="font-medium">{app.student?.profile?.name ?? 'Unknown'}</span>
                          </div>
                        </td>
                        <td>{app.job?.title ?? 'Unknown'}</td>
                        <td className="text-secondary text-sm">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}</td>
                        <td><Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No applicants yet" text="Applications will appear here as candidates apply." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
            )}
          </DashboardSection>

          <DashboardSection
            title="Active jobs"
            subtitle="Your published job postings and applicant volume."
            action={
              <Link to="/employer/post-job"><Button variant="ghost" size="sm">+ Post job</Button></Link>
            }
            className="section--mt"
          >
            {jobsLoading ? (
              <Skeleton variant="table" lines={3} />
            ) : recentJobs.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Applicants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id}>
                        <td className="font-medium">{job.title}</td>
                        <td className="text-secondary text-sm">{job.location}</td>
                        <td><Badge kind={resolveBadgeKind(job.status)}>{job.status}</Badge></td>
                        <td className="text-secondary text-sm">{job.applicantCount ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No jobs posted yet" text="Post your first opening to start receiving applicants." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
            )}
          </DashboardSection>
        </>
      ) : (
       <EmptyState title="No analytics yet" text="Post jobs to start tracking performance." />
     )}
    </div>
  );
};