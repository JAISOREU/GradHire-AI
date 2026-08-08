import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { employersApi, analyticsApi } from '../../core/api/endpoints/employers';
import { StatCard } from '../../components/StatCard';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerDashboardPage = () => {
  const { user } = useAuth();
  const { data: jobs, loading: jobsLoading } = useAsync(() => employersApi.listJobs(), []);
  const { data: analytics } = useAsync(() => analyticsApi.getSnapshot(), []);

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employer dashboard{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>
        Manage your job postings and review applicants.
      </p>

      <div className="status-strip" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <StatCard label="Active jobs" value={analytics?.activeJobs ?? jobs?.length ?? 0} icon="🗂️" />
        <StatCard label="Applications today" value={analytics?.applicationsToday ?? 0} icon="📨" />
        <StatCard label="Profile views" value={analytics?.views ?? 0} icon="👀" />
        <StatCard label="Pending interviews" value={analytics?.pendingInterviews ?? 0} icon="🗓️" />
      </div>

      <section className="section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Your listings</h2>
          <Link to="/employer/post-job"><Button variant="ghost" size="sm">+ Post job</Button></Link>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          {jobsLoading ? (
            <LoadingState label="Loading listings…" />
          ) : jobs && jobs.length > 0 ? (
            <div className="list">
              {jobs.slice(0, 5).map((job) => (
                <article key={job.id} className="list-item">
                  <div className="list-item__head">
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{job.title}</h3>
                      <div className="list-item__meta">
                        <span>{job.company}</span>
                        <span>{job.location}</span>
                        <span>{job.status}</span>
                      </div>
                    </div>
                    <Link to="/employer/jobs"><Button variant="secondary" size="sm">Manage</Button></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon="🏢" title="No jobs posted yet" text="Post your first opening to start receiving applicants." />
          )}
        </div>
      </section>
    </div>
  );
};
