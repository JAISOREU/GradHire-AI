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
import type { Job } from '../../core/types';

const formatSalary = (job: Job) => {
  if (job.salaryUndisclosed) return 'Confidential';
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin != null) return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()}+`;
  return null;
};

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

  const salary = formatSalary(job);
  const isExternal = !!job.isExternal;
  const workplaceLabel = job.workplaceType === 'ONSITE' ? 'Work From Office' : job.workplaceType === 'HYBRID' ? 'Hybrid' : job.workplaceType === 'REMOTE' ? 'Remote' : job.workplaceType;
  const experienceLabel = job.experienceLevel ? job.experienceLevel.replace(/_/g, ' ').toLowerCase() : null;

  return (
    <div className="page fade-in">
      <Link to="/jobs" className="back-link">← Back to jobs</Link>

      <div className="card section--mt">
        <PageHeader
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span>{job.title}</span>
              {isExternal && (
                <span className="badge badge--external" style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)' }}>
                  External Job
                </span>
              )}
            </div>
          }
          subtitle={
            isExternal && job.sourceName
              ? `${job.company} · ${job.location} · Source: ${job.sourceName}`
              : `${job.company} · ${job.location}`
          }
        />

        <div className="grid grid-cols-2 gap-4 section--mt">
          {experienceLabel && (
            <div>
              <span className="text-secondary text-sm">Experience</span>
              <div className="font-medium">{experienceLabel}</div>
            </div>
          )}
          {workplaceLabel && (
            <div>
              <span className="text-secondary text-sm">Workplace</span>
              <div className="font-medium">{workplaceLabel}</div>
            </div>
          )}
          {salary && (
            <div>
              <span className="text-secondary text-sm">Salary</span>
              <div className="font-medium">{salary}</div>
            </div>
          )}
          {job.sourceJobId && (
            <div>
              <span className="text-secondary text-sm">Job Request ID</span>
              <div className="font-medium">{job.sourceJobId}</div>
            </div>
          )}
          {job.nightShift && (
            <div>
              <span className="text-secondary text-sm">Schedule</span>
              <div className="font-medium">Night Shift</div>
            </div>
          )}
          <div>
            <span className="text-secondary text-sm">Status</span>
            <div className="font-medium">{job.status}</div>
          </div>
        </div>

        <div className="section--mt">
          {isExternal && job.applicationUrl ? (
            <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
              <Button>Apply on {job.sourceName || 'external site'}</Button>
            </a>
          ) : isAuthenticated && user && user.role === 'STUDENT' ? (
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

      {job.description && (
        <div className="card section--mt">
          <h3 className="card__title">Job Description</h3>
          <p className="card__subtitle text-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>
      )}

      {(job.requiredSkills ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Key Responsibilities</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills ?? []).map((skill) => (
              <span key={skill} className="badge">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(job.preferredSkills ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Qualifications and Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {(job.preferredSkills ?? []).map((skill) => (
              <span key={skill} className="badge badge--muted">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(job.benefits ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Perks and Benefits</h3>
          <ul style={{ paddingLeft: 'var(--space-5)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {job.benefits!.map((benefit) => (
              <li key={benefit.id} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{benefit.name}</li>
            ))}
          </ul>
        </div>
      )}

      {job.companyRef?.description && (
        <div className="card section--mt">
          <h3 className="card__title">About the Company</h3>
          <p className="card__subtitle">{job.companyRef.description}</p>
        </div>
      )}

      {isExternal && (
        <div className="card section--mt">
          <h3 className="card__title">Source</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {job.sourceName || 'External source'}
            </span>
            {job.sourceUrl && (
              <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
                View Original Posting
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
