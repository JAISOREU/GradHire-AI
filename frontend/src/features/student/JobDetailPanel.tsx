import { Alert } from '../../components/Alert';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { MatchExplanation } from '../../components/MatchExplanation';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { SimilarJobs } from '../../components/SimilarJobs';
import { Tooltip } from '../../components/Tooltip';
import { useAsync } from '../../core/hooks/useAsync';
import { aiApi } from '../../core/api/endpoints/ai';
import type { JobMatchResult } from '../../core/api/endpoints/ai';
import { jobsApi, recommendationsApi } from '../../core/api/endpoints/jobs';
import { applicationsApi } from '../../core/api/endpoints/applications';
import { useToast } from '../../core/toast/ToastContext';
import { cleanText } from '../../core/utils/text';
import { useEffect, useRef, useState } from 'react';
import type { Job } from '../../core/types';

const formatTypeLabel = (type?: string): string =>
  (type ?? 'HIRING')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');

const formatSalary = (job: Job) => {
  if (job.salaryUndisclosed) return 'Confidential';
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin != null) return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()}+`;
  return 'Negotiable';
};

type SimilarJob = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

type JobDetailPanelProps = {
  jobId: string;
  matchScore?: number;
  saved?: boolean;
  saving?: boolean;
  applied?: boolean;
  onToggleSave?: () => void;
  onApplied?: () => void;
};

export const JobDetailPanel = ({ jobId, matchScore = 0, saved, saving, applied, onToggleSave, onApplied }: JobDetailPanelProps) => {
  const { data: job, loading, error, reload } = useAsync(() => jobsApi.getById(jobId), [jobId]);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const { addToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [job?.id, jobId]);

  const [match, setMatch] = useState<JobMatchResult | null>(null);
  const [similar, setSimilar] = useState<SimilarJob[]>([]);

  useEffect(() => {
    let cancelled = false;
    aiApi.matchJobById(jobId)
      .then((m) => {
        if (!cancelled) setMatch(m);
      })
      .catch(() => {});
    recommendationsApi
      .ai(6)
      .then((r) => {
        if (cancelled) return;
        const list = (r.recommendations ?? [])
          .filter((rec) => rec.id !== jobId)
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
  }, [jobId]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError('');
    try {
      await applicationsApi.submit({ jobId });
      addToast('success', 'Application submitted successfully');
      onApplied?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setApplyError(msg);
      addToast('error', msg);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="browse-detail__loading">
        <LoadingState label="Loading job details…" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="browse-detail__empty">
        {error ? (
          <Alert>
            {error}{' '}
            <button onClick={reload} className="link">Retry</button>
          </Alert>
        ) : (
          <EmptyState icon="Briefcase" title="Job not found" text="This job may no longer be available." />
        )}
      </div>
    );
  }

  const company = job.company || job.companyRef?.name || 'Not specified';
  const location = job.location || 'Remote';
  const workplaceLabel = job.workplaceType === 'ONSITE' ? 'Work from office' : job.workplaceType === 'HYBRID' ? 'Hybrid' : job.workplaceType === 'REMOTE' ? 'Remote' : '';
  const experienceLabel = job.experienceLevel ? job.experienceLevel.replace(/_/g, ' ').toLowerCase() : '';
  const salary = formatSalary(job);
  const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';

  return (
    <div ref={scrollRef} className="browse-detail__body">
      <div className="browse-detail__actionbar">
        <div className="browse-detail__actions">
          {job.isExternal && job.applicationUrl ? (
            <Tooltip content="Apply directly on the company website">
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                <Button>Apply on company website</Button>
              </a>
            </Tooltip>
          ) : applied ? (
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
          )}
          <Tooltip content={saved ? 'Remove from saved jobs' : 'Save this job'}>
            <Button variant="secondary" onClick={onToggleSave} disabled={saving} aria-pressed={saved}>
              {saved ? 'Saved' : 'Save'}
            </Button>
          </Tooltip>
        </div>
        {matchScore > 0 && (
          <div className="match-score match-score--card flex-shrink-0" role="progressbar" aria-valuenow={matchScore} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${Math.round(matchScore)}% match score`} aria-label={`Match score ${Math.round(matchScore)}%`}>
            <div className="match-score__top"><span>Match score</span><strong>{Math.round(matchScore)}%</strong></div>
            <div className="match-score__track"><div className="match-score__fill" style={{ width: `${Math.round(matchScore)}%` }} /></div>
          </div>
        )}
      </div>

      {applyError && <Alert className="browse-detail__section">{applyError}</Alert>}

      <div className="browse-detail__heading">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="browse-detail__title">{job.title}</h2>
          {job.isExternal && <span className="badge badge--external">External Listing</span>}
        </div>
        <p className="browse-detail__company">{company} · {location}</p>
        <div className="list-item__meta">
          <Badge kind={resolveBadgeKind(job.type)}>{formatTypeLabel(job.type)}</Badge>
          {workplaceLabel && <span>{workplaceLabel}</span>}
          {experienceLabel && <span>{experienceLabel}</span>}
          {salary && <span>{salary}</span>}
          <span>Posted {postedDate}</span>
        </div>
      </div>

      {job.description && (
        <section className="browse-detail__section">
          <h3 className="card__title">Overview</h3>
          <p className="browse-detail__text">{cleanText(job.description)}</p>
        </section>
      )}

      {(job.responsibilities ?? '').trim() && (
        <section className="browse-detail__section">
          <h3 className="card__title">Responsibilities</h3>
          <p className="browse-detail__text">{cleanText(job.responsibilities)}</p>
        </section>
      )}

      {(job.requiredQualifications ?? '').trim() && (
        <section className="browse-detail__section">
          <h3 className="card__title">Requirements</h3>
          <p className="browse-detail__text">{cleanText(job.requiredQualifications)}</p>
        </section>
      )}

      {(job.preferredQualifications ?? '').trim() && (
        <section className="browse-detail__section">
          <h3 className="card__title">Preferred qualifications</h3>
          <p className="browse-detail__text">{cleanText(job.preferredQualifications)}</p>
        </section>
      )}

      {(job.requiredSkills ?? []).length > 0 && (
        <section className="browse-detail__section">
          <h3 className="card__title">Required skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills!.map((skill) => (
              <span key={skill} className="badge">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {(job.preferredSkills ?? []).length > 0 && (
        <section className="browse-detail__section">
          <h3 className="card__title">Preferred skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.preferredSkills!.map((skill) => (
              <span key={skill} className="badge badge--muted">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {(job.benefits ?? []).length > 0 && (
        <section className="browse-detail__section">
          <h3 className="card__title">Benefits</h3>
          <ul className="pl-5 m-0 flex flex-col gap-2">
            {job.benefits!.map((benefit) => (
              <li key={benefit.id} className="text-sm text-text-secondary">{benefit.name}</li>
            ))}
          </ul>
        </section>
      )}

      {(job.companyRef?.description || job.companyRef?.industry) && (
        <section className="browse-detail__section">
          <h3 className="card__title">About the company</h3>
          {job.companyRef?.name && <p className="browse-detail__text font-medium mb-2">{job.companyRef.name}</p>}
          {job.companyRef?.industry && (
            <p className="browse-detail__text flex items-center gap-2 mb-2">
              <PhosphorIcon name="Buildings" size={16} className="text-text-secondary flex-shrink-0" />
              {job.companyRef.industry}
            </p>
          )}
          {job.companyRef?.description && <p className="browse-detail__text">{cleanText(job.companyRef.description)}</p>}
        </section>
      )}

      {match && (
        <section className="browse-detail__section">
          <h3 className="card__title">AI match</h3>
          <MatchExplanation matched={match.matchingSkills} gaps={match.missingSkills} />
        </section>
      )}

      {similar.length > 0 && (
        <section className="browse-detail__section">
          <SimilarJobs jobs={similar} />
        </section>
      )}
    </div>
  );
};