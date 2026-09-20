import { Alert } from '../../components/Alert';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi, recommendationsApi } from '../../core/api/endpoints/jobs';
import { applicationsApi } from '../../core/api/endpoints/applications';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { aiApi } from '../../core/api/endpoints/ai';
import type { JobMatchResult } from '../../core/api/endpoints/ai';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { useToast } from '../../core/toast/ToastContext';
import { Button } from '../../components/Button';
import { CompanyCard } from '../../components/CompanyCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { MatchExplanation } from '../../components/MatchExplanation';
import { PageHeader } from '../../components/PageHeader';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { SimilarJobs } from '../../components/SimilarJobs';
import { Tooltip } from '../../components/Tooltip';
import { useEffect, useState } from 'react';
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

type SimilarJob = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

export const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: job, loading, reload } = useAsync(() => jobsApi.getById(id ?? ''), [id]);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const [match, setMatch] = useState<JobMatchResult | null>(null);
  const [similar, setSimilar] = useState<SimilarJob[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    aiApi.matchJobById(id)
      .then((m) => {
        if (!cancelled) setMatch(m);
      })
      .catch(() => {});
    recommendationsApi
      .ai(6)
      .then((r) => {
        if (cancelled) return;
        const list = (r.recommendations ?? [])
          .filter((rec) => rec.id !== id)
          .slice(0, 3)
          .map((rec) => ({
            id: rec.id,
            title: rec.title,
            company: rec.company ?? 'Not specified',
            matchScore: rec.score,
          }));
        setSimilar(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

useEffect(() => {
    if (!id || !isAuthenticated || user?.role !== 'STUDENT') return;
    let cancelled = false;
    savedJobsApi
      .check(id)
      .then((r) => {
        if (!cancelled) setSaved(r.saved ?? false);
      })
      .catch(() => {});
    applicationsApi
      .checkApplied(id)
      .then((r) => {
        if (!cancelled) setApplied(r.applied ?? false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, user?.role]);

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

  const handleToggleSave = async () => {
    if (!user || !id) return;
    setSaving(true);
    try {
      if (saved) {
        await savedJobsApi.unsave(id);
        setSaved(false);
        addToast('success', 'Job removed from saved jobs');
      } else {
        await savedJobsApi.save(id);
        setSaved(true);
        addToast('success', 'Job saved');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to update saved jobs');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading job…" />;
  if (!job) return <EmptyState title="Job not found" text="This job may no longer be available." />;

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
          <Link to="/jobs" className="back-link"><PhosphorIcon name="ArrowLeft" size={14} /> Back to jobs</Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 section--mt">
            <div className="lg:col-span-2 min-w-0">
              <div className="card">
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

            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <div className="card">
                <div className="flex flex-wrap gap-3">
                  {isExternal && job.applicationUrl ? (
                    <Tooltip content="Apply directly on the company website">
                      <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <Button>Apply on Company Site</Button>
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
                  {isAuthenticated && user?.role === 'STUDENT' && (
                    <Tooltip content={saved ? 'Remove from saved jobs' : 'Save this job'}>
                      <Button variant="secondary" onClick={handleToggleSave} disabled={saving} aria-pressed={saved}>
                        {saved ? 'Saved' : 'Save'}
                      </Button>
                    </Tooltip>
                  )}
</div>
                {error && <Alert className="section--mt">{error}</Alert>}
                {isAuthenticated && user?.role === 'STUDENT' && (
                  <Tooltip content="Ask the AI assistant about this role">
                    <Button
                      variant="secondary"
                      className="mt-3 w-full"
                      onClick={() =>
                        navigate('/student/ai-assistant', {
                          state: { jobId: job.id, jobTitle: job.title, jobCompany: company },
                        })
                      }
                    >
                      Ask AI about this job
                    </Button>
                  </Tooltip>
                )}
              </div>

              {match && (
                <div className="card">
                  <h3 className="card__title">AI match</h3>
                  <MatchExplanation matched={match.matchingSkills} gaps={match.missingSkills} />
                </div>
              )}

              {similar.length > 0 && <SimilarJobs jobs={similar} />}

              {job.companyRef && (
                <CompanyCard
                  company={{
                    name: company,
                    industry: job.companyRef.industry,
                    description: job.companyRef.description,
                  }}
                />
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};
