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
import { Avatar } from '../../components/Avatar';

type Analytics = {
  activeJobs: number;
  applicationsToday: number;
  totalApplications: number;
  awaitingReview: number;
  shortlisted: number;
  interviewing: number;
  offers: number;
  hired: number;
  rejected: number;
  withdrawn: number;
};

type EmployerApplicant = {
  id: string;
  status: string;
  submittedAt?: string;
  student?: { profile?: { name?: string; skills?: string[] } | null } | null;
  job?: { title?: string; company?: string } | null;
};

export const EmployerDashboardPage = () => {
  const { user } = useAuth();
  const { data: analytics, loading: analyticsLoading } = useAsync(() => analyticsApi.getSnapshot(), []);
  const { data: applicants, loading: applicantsLoading } = useAsync(() => employersApi.listApplicants(), []);
  const { data: jobs, loading: jobsLoading } = useAsync(() => employersApi.listJobs(), []);

  const analyticsData = analytics as Analytics | null | undefined;
  const activeJobs = analyticsData?.activeJobs ?? 0;
  const appsToday = analyticsData?.applicationsToday ?? 0;
  const totalApplicants = analyticsData?.totalApplications ?? 0;
  const shortlisted = analyticsData?.shortlisted ?? 0;
  const interviewing = analyticsData?.interviewing ?? 0;

  const recentApplicants = (applicants as EmployerApplicant[] | undefined)?.slice(0, 5) ?? [];
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="page fade-in">
      <PageHeader
        title={<>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</>}
        subtitle="Your hiring activity at a glance."
      />

      <div className="status-strip status-strip--4 section--mt">
        <KPICard
          label="Active jobs"
          value={activeJobs}
          icon="🗂️"
          trend={{ direction: activeJobs > 0 ? 'up' : 'neutral', value: `${activeJobs} live`, label: 'postings' }}
          action={<Link to="/employer/jobs"><Button variant="ghost" size="sm">Manage</Button></Link>}
        />
        <KPICard
          label="Applicants"
          value={totalApplicants}
          icon="📨"
          trend={{ direction: totalApplicants > 0 ? 'up' : 'neutral', value: `${appsToday} today`, label: 'new' }}
          action={<Link to="/employer/applicants"><Button variant="ghost" size="sm">Review</Button></Link>}
        />
        <KPICard
          label="Shortlisted"
          value={shortlisted}
          icon="⭐"
          trend={{ direction: shortlisted > 0 ? 'up' : 'neutral', value: `${shortlisted} candidates`, label: 'total' }}
          action={<Link to="/employer/applicants"><Button variant="ghost" size="sm">View</Button></Link>}
        />
        <KPICard
          label="Interviews"
          value={interviewing}
          icon="🗓️"
          trend={{ direction: interviewing > 0 ? 'up' : 'neutral', value: `${interviewing} scheduled`, label: 'pending' }}
          action={<Link to="/employer/interviews"><Button variant="ghost" size="sm">Schedule</Button></Link>}
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
        {analyticsLoading || applicantsLoading ? (
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
          <EmptyState icon="👥" title="No applicants yet" text="Applications will appear here as candidates apply." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
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
                    <td className="text-secondary text-sm">{job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="🏢" title="No jobs posted yet" text="Post your first opening to start receiving applicants." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
        )}
      </DashboardSection>
    </div>
  );
};
