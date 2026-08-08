import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { employersApi, analyticsApi } from '../../core/api/endpoints/employers';
import { KPICard } from '../../components/KPICard';
import { DashboardSection } from '../../components/DashboardSection';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';

export const EmployerDashboardPage = () => {
  const { user } = useAuth();
  const { data: jobs, loading: jobsLoading } = useAsync(() => employersApi.listJobs(), []);
  const { data: analytics } = useAsync(() => analyticsApi.getSnapshot(), []);
  const { data: applicants, loading: applicantsLoading } = useAsync(() => employersApi.listApplicants(), []);

  const activeJobs = analytics?.activeJobs ?? jobs?.length ?? 0;
  const appsToday = analytics?.applicationsToday ?? 0;
  const views = analytics?.views ?? 0;
  const interviews = analytics?.pendingInterviews ?? 0;

  return (
    <div className="page fade-in">
      <PageHeader
        title={<>Employer dashboard{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</>}
        subtitle="Manage your job postings and review applicants."
      />

      <div className="status-strip status-strip--4 section--mt">
        <KPICard
          label="Active jobs"
          value={activeJobs}
          icon="🗂️"
          trend={{ direction: activeJobs > 0 ? 'up' : 'neutral', value: `${activeJobs} live`, label: 'postings' }}
          action={
            <Link to="/employer/jobs"><Button variant="ghost" size="sm">Manage</Button></Link>
          }
        />
        <KPICard
          label="Applications"
          value={appsToday}
          icon="📨"
          trend={{ direction: appsToday > 0 ? 'up' : 'neutral', value: `${appsToday} today`, label: 'new' }}
          action={
            <Link to="/employer/applicants"><Button variant="ghost" size="sm">Review</Button></Link>
          }
        />
        <KPICard
          label="Profile views"
          value={views}
          icon="👀"
          trend={{ direction: views > 0 ? 'up' : 'neutral', value: `${views} total`, label: 'views' }}
        />
        <KPICard
          label="Pending interviews"
          value={interviews}
          icon="🗓️"
          trend={{ direction: interviews > 0 ? 'up' : 'neutral', value: `${interviews} scheduled`, label: 'pending' }}
          action={
            <Link to="/employer/interviews"><Button variant="ghost" size="sm">Schedule</Button></Link>
          }
        />
      </div>

      <DashboardSection
        title="Recent applicants"
        subtitle="Candidates who recently applied to your jobs."
        action={
          <Link to="/employer/applicants"><Button variant="ghost" size="sm">View all →</Button></Link>
        }
        className="section--mt"
      >
        {applicantsLoading ? (
          <Skeleton variant="table" lines={4} />
        ) : applicants && applicants.length > 0 ? (
          applicants.slice(0, 5).map((app) => (
            <div key={app.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{app.job?.title ?? 'Unknown'}</h3>
                  <div className="list-item__meta">
                    <span>Application</span>
                    <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                  </div>
                </div>
                <Link to="/employer/applicants"><Button variant="secondary" size="sm">Review</Button></Link>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon="👥" title="No applicants yet" text="Applications will appear here as candidates apply." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
        )}
      </DashboardSection>

      <DashboardSection
        title="Your listings"
        subtitle="Active job postings and their status."
        action={
          <Link to="/employer/post-job"><Button variant="ghost" size="sm">+ Post job</Button></Link>
        }
        className="section--mt"
      >
        {jobsLoading ? (
          <Skeleton variant="table" lines={3} />
        ) : jobs && jobs.length > 0 ? (
          jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{job.title}</h3>
                  <div className="list-item__meta">
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <Badge kind={resolveBadgeKind(job.status)}>{job.status}</Badge>
                  </div>
                </div>
                <Link to="/employer/jobs"><Button variant="secondary" size="sm">Manage</Button></Link>
              </div>
            </div>
          ))
        ) : (
          <EmptyState icon="🏢" title="No jobs posted yet" text="Post your first opening to start receiving applicants." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
        )}
      </DashboardSection>
    </div>
  );
};
