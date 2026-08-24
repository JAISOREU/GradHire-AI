import { useParams, Link } from 'react-router-dom';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { applicationsApi } from '../../core/api/endpoints/applications';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { useToast } from '../../core/toast/ToastContext';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Tooltip } from '../../components/Tooltip';
import { useState } from 'react';
import type { Job } from '../../core/types';
import { cleanText } from '../../core/utils/text';

const formatSalary = (job: Job) => {
  if (job.salaryUndisclosed) return 'Confidential';
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin != null) return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()}+`;
  if (job.negotiable) return 'Negotiable';
  return 'Negotiable';
};

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { data: job, loading, reload } = useAsync(() => jobsApi.getById(id ?? ''), [id]);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleApply = async () => {
    if (!user || !id) return;
    setApplying(true);
    setError('');
    try {
      await applicationsApi.submit({ jobId: id });
      setApplied(true);
      addToast('success', 'Application submitted successfully');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
      addToast('error', err instanceof Error ? err.message : 'Failed to submit application.');
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
  const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';
  const company = job.company || job.companyRef?.name || 'Not specified';
  const location = job.location || 'Remote';

  return (
    <div className="public-page">
      <section className="section-full">
        <div className="section-inner">
          <Link to="/jobs" className="back-link">← Back to jobs</Link>

          <div className="card section--mt">
        <PageHeader
          title={
            <div className="flex items-center gap-3 flex-wrap">
              <span>{job.title}</span>
              {isExternal && (
                <span className="badge badge--external bg-info-soft text-info">
                  External Listing
                </span>
              )}
            </div>
          }
          subtitle={
            isExternal && job.sourceName
              ? `${company} · ${location} · Source: ${job.sourceName}`
              : `${company} · ${location}`
          }
        />

        <div className="grid grid-cols-2 gap-4 section--mt">
          <div>
            <span className="text-secondary text-sm">Location</span>
            <div className="font-medium">{location}</div>
          </div>
          {workplaceLabel && (
            <div>
              <span className="text-secondary text-sm">Work arrangement</span>
              <div className="font-medium">{workplaceLabel}</div>
            </div>
          )}
          <div>
            <span className="text-secondary text-sm">Employment type</span>
            <div className="font-medium">{job.type === 'INTERNSHIP' ? 'Internship' : job.type?.toLowerCase().replace('_', ' ') ?? 'Hiring'}</div>
          </div>
          {experienceLabel && (
            <div>
              <span className="text-secondary text-sm">Experience level</span>
              <div className="font-medium">{experienceLabel}</div>
            </div>
          )}
          {salary && (
            <div>
              <span className="text-secondary text-sm">Salary</span>
              <div className="font-medium">{salary}</div>
            </div>
          )}
          <div>
            <span className="text-secondary text-sm">Posted</span>
            <div className="font-medium">{postedDate}</div>
          </div>
        </div>

        <div className="section--mt flex gap-3 flex-wrap">
          {isExternal && job.applicationUrl ? (
            <Tooltip content="Apply directly on the company website">
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                <Button iconRight={<Icon name="external" size={16} />}>Apply on Company Site</Button>
              </a>
            </Tooltip>
          ) : isAuthenticated && user && user.role === 'STUDENT' ? (
            applied ? (
              <Tooltip content="You have already applied to this job">
                <Button disabled>Applied</Button>
              </Tooltip>
            ) : job.status === 'PUBLISHED' ? (
              <Tooltip content="Submit your application for this role">
                <Button onClick={handleApply} disabled={applying}>
                  {applying ? 'Applying…' : 'Apply now'}
                </Button>
              </Tooltip>
            ) : (
              <Tooltip content="This job is not currently accepting applications">
                <Button disabled>Not accepting applications</Button>
              </Tooltip>
            )
          ) : (
            <Link to="/login"><Button>Sign in to apply</Button></Link>
          )}
        </div>
        {error && <div className="message message--error section--mt" role="alert">{error}</div>}
      </div>

      {job.description && (
        <div className="card section--mt">
          <h3 className="card__title">Overview</h3>
          <div className="card__subtitle whitespace-pre-wrap">{cleanText(job.description)}</div>
        </div>
      )}

      {(job.responsibilities ?? '').trim() && (
        <div className="card section--mt">
          <h3 className="card__title">Responsibilities</h3>
          <div className="card__subtitle whitespace-pre-wrap">{cleanText(job.responsibilities)}</div>
        </div>
      )}

      {(job.requiredQualifications ?? '').trim() && (
        <div className="card section--mt">
          <h3 className="card__title">Requirements</h3>
          <div className="card__subtitle whitespace-pre-wrap">{cleanText(job.requiredQualifications)}</div>
        </div>
      )}

      {(job.preferredQualifications ?? '').trim() && (
        <div className="card section--mt">
          <h3 className="card__title">Preferred Qualifications</h3>
          <div className="card__subtitle whitespace-pre-wrap">{cleanText(job.preferredQualifications)}</div>
        </div>
      )}

      {(job.requiredSkills ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.requiredSkills ?? []).map((skill) => (
              <span key={skill} className="badge">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(job.preferredSkills ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Preferred Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.preferredSkills ?? []).map((skill) => (
              <span key={skill} className="badge badge--muted">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {(job.benefits ?? []).length > 0 && (
        <div className="card section--mt">
          <h3 className="card__title">Benefits</h3>
          <ul className="pl-5 m-0 flex flex-col gap-2">
            {job.benefits!.map((benefit) => (
              <li key={benefit.id} className="text-sm text-text-secondary">{benefit.name}</li>
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
          <h3 className="card__title">Original Posting</h3>
          <div className="flex flex-col gap-2">
            <span className="text-text-secondary">
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
      </section>
    </div>
  );
};
