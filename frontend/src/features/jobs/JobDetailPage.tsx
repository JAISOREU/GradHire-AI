import { useParams, Link } from 'react-router-dom';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { applicationsApi } from '../../core/api/endpoints/applications';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { useState } from 'react';

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { data: job, loading, reload } = useAsync(() => jobsApi.getById(id ?? ''), [id]);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!user || !id) return;
    setApplying(true);
    try {
      await applicationsApi.submit({ jobId: id });
      setApplied(true);
      reload();
    } catch {
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingState label="Loading job…" />;
  if (!job) return <EmptyState icon="🔍" title="Job not found" text="This job may no longer be available." />;

  return (
    <div className="page fade-in">
      <Link to="/jobs" className="back-link">← Back to jobs</Link>
      <div className="card section--mt">
        <PageHeader title={job.title} subtitle={`${job.company} · ${job.location}`} />

        <div className="grid grid-cols-2 gap-4 section--mt">
          <div>
            <span className="text-secondary text-sm">Type</span>
            <div className="font-medium">{job.type}</div>
          </div>
          <div>
            <span className="text-secondary text-sm">Experience</span>
            <div className="font-medium">{job.experienceLevel}</div>
          </div>
          <div>
            <span className="text-secondary text-sm">Workplace</span>
            <div className="font-medium">{job.workplaceType}</div>
          </div>
          <div>
            <span className="text-secondary text-sm">Status</span>
            <div className="font-medium">{job.status}</div>
          </div>
        </div>

        {job.description && (
          <div className="section--mt">
            <h3 className="card__title">Description</h3>
            <p className="card__subtitle text-pre-wrap">{job.description}</p>
          </div>
        )}

        {(job.requiredSkills ?? []).length > 0 && (
          <div className="section--mt">
            <h3 className="card__title">Required skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.requiredSkills ?? []).map((skill) => (
                <span key={skill} className="badge">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {job.salaryMin !== undefined && job.salaryMin !== null && (
          <div className="section--mt">
            <h3 className="card__title">Salary range</h3>
            <p className="card__subtitle">
              {job.currency} {job.salaryMin.toLocaleString()} — {job.salaryMax?.toLocaleString() ?? 'Not specified'}
              {job.negotiable && ' (Negotiable)'}
            </p>
          </div>
        )}

        <div className="section--mt">
          {isAuthenticated && user && user.role === 'STUDENT' ? (
            applied ? (
              <Button disabled>Applied</Button>
            ) : job.status === 'PUBLISHED' ? (
              <Button onClick={handleApply} disabled={applying}>
                {applying ? 'Applying…' : 'Apply now'}
              </Button>
            ) : (
              <Button disabled>Not accepting applications</Button>
            )
          ) : (
            <Link to="/login"><Button>Sign in to apply</Button></Link>
          )}
        </div>
      </div>
    </div>
  );
};
