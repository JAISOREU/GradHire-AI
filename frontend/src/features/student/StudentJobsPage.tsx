import { Alert } from '../../components/Alert';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { useToast } from '../../core/toast/ToastContext';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Tooltip } from '../../components/Tooltip';
import type { ExperienceLevel, Job, JobType, PaginatedResponse, WorkplaceType } from '../../core/types';

const JOB_TYPES: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'HIRING', label: 'Hiring' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'APPRENTICESHIP', label: 'Apprenticeship' },
  { value: 'TEMPORARY', label: 'Temporary' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel | ''; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'NO_EXPERIENCE', label: 'No experience' },
  { value: 'ENTRY_LEVEL', label: 'Entry level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID_LEVEL', label: 'Mid level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'MANAGER', label: 'Manager' },
];

const WORKPLACE_TYPES: { value: WorkplaceType | ''; label: string }[] = [
  { value: '', label: 'All workplaces' },
  { value: 'ONSITE', label: 'Work from office' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'REMOTE', label: 'Remote' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: '-createdAt', label: 'Oldest' },
  { value: 'title', label: 'Featured' },
  { value: 'matchScore', label: 'Best match' },
  { value: 'salaryMin', label: 'Highest salary' },
];

const PAGE_SIZE = 20;

const formatTimeAgo = (iso?: string) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const formatSalary = (job: { salaryMin?: number | null; salaryMax?: number | null; currency?: string | null; salaryUndisclosed?: boolean | null; negotiable?: boolean | null }) => {
  if (job.salaryUndisclosed) return 'Confidential';
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()} — ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin != null) return `${job.currency || 'PHP'} ${job.salaryMin.toLocaleString()}+`;
  if (job.negotiable) return 'Negotiable';
  return 'Negotiable';
};

const labelFor = (value: string, list: { value: string; label: string }[]) => {
  const found = list.find((o) => o.value.toLowerCase().replace(/_/g, ' ') === value.toLowerCase().replace(/_/g, ' '));
  if (found) return found.label;
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const StudentJobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<JobType | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | ''>('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  const activeFilterCount = useMemo(
    () => [type, experienceLevel, workplaceType, city, search].filter(Boolean).length,
    [type, experienceLevel, workplaceType, city, search],
  );

  const { data, loading, error, reload } = useAsync<PaginatedResponse<Job>>(
    () =>
      jobsApi.listPaginated({
        search: search || undefined,
        type: type || undefined,
        experienceLevel: experienceLevel || undefined,
        workplaceType: workplaceType || undefined,
        city: city || undefined,
        sort: sortBy,
        page,
        limit: PAGE_SIZE,
      }),
    [search, type, experienceLevel, workplaceType, city, sortBy, page],
  );

  const { data: savedData } = useAsync(() => savedJobsApi.listMine<Job>(100), []);

  useEffect(() => {
    setPage(1);
  }, [search, type, experienceLevel, workplaceType, city, sortBy]);

  useEffect(() => {
    if (savedData) {
      setSaved(new Set(savedData.map((s) => s.id)));
    }
  }, [savedData]);

  const { addToast } = useToast();

  const handleSave = async (jobId: string) => {
    if (saving.has(jobId)) return;
    const isSaved = saved.has(jobId);
    setSaving((s) => new Set(s).add(jobId));
    const previousSaved = new Set(saved);
    const previousSaving = new Set(saving);

    try {
      if (isSaved) {
        setSaved((s) => {
          const next = new Set(s);
          next.delete(jobId);
          return next;
        });
        await jobsApi.unsave(jobId);
        addToast('success', 'Job removed from saved');
      } else {
        setSaved((s) => new Set(s).add(jobId));
        await jobsApi.save(jobId);
        addToast('success', 'Job saved');
      }
    } catch (err) {
      setSaved(previousSaved);
      setSaving(previousSaving);
      addToast('error', err instanceof Error ? err.message : 'Failed to update saved jobs. Please try again.');
      return;
    } finally {
      setSaving((s) => {
        const next = new Set(s);
        next.delete(jobId);
        return next;
      });
    }
  };

  const handleApply = (job: Job) => {
    if (job.isExternal && job.applicationUrl) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/jobs/${job.id}`);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setType('');
    setExperienceLevel('');
    setWorkplaceType('');
    setCity('');
    setSortBy('createdAt');
  };

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const savedCount = saved.size;

  const firstIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="public-page">
      <section className="section-full">
        <div className="section-inner">
          <PageHeader
            title="Browse opportunities"
            subtitle="Explore roles matched to your profile and preferences."
            action={
              <div className="flex gap-2 items-center">
                {user?.name && (
                  <span className="text-sm text-text-secondary">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                )}
                <span className="badge badge--muted">
                  <span>Saved {savedCount}</span>
                </span>
              </div>
            }
          />
        </div>
      </section>

      <section className="section-full">
        <div className="section-inner">
          <div
            className="card section--mt p-5 sticky top-4 z-10 shadow-sm"
          >
            <div className="filter-bar flex-wrap items-center gap-3">
              <Tooltip content="Search by job title, company, or skills">
                <div className="flex items-center gap-2 flex-[1_1_240px]">
                  <input
                    className="input"
                    type="search"
                    placeholder="Job title, company, skills…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Keyword search"
                  />
                </div>
              </Tooltip>
              <Tooltip content="Filter by city or region">
                <div className="flex items-center gap-2 flex-[1_1_160px]">
                  <input
                    className="input"
                    type="text"
                    placeholder="City or region"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    aria-label="Location"
                  />
                </div>
              </Tooltip>
              <Tooltip content="Filter by employment type">
                <select
                  className="select select--auto"
                  value={type}
                  onChange={(e) => setType(e.target.value as JobType | '')}
                  aria-label="Job type"
                >
                  {JOB_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Tooltip>
              <Tooltip content="Filter by required experience level">
                <select
                  className="select select--auto"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | '')}
                  aria-label="Experience level"
                >
                  {EXPERIENCE_LEVELS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Tooltip>
              <Tooltip content="Filter by work arrangement">
                <select
                  className="select select--auto"
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType | '')}
                  aria-label="Workplace type"
                >
                  {WORKPLACE_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Tooltip>
              <Tooltip content="Sort results by relevance or date">
                <select
                  className="select select--auto"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Tooltip>
              {activeFilterCount > 0 && (
                <Tooltip content="Remove all active filters">
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary whitespace-nowrap"
                    onClick={clearFilters}
                  >
                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </button>
                </Tooltip>
              )}
            </div>

            <div
              className="flex items-center justify-between mt-3 gap-2 flex-wrap text-sm text-text-secondary"
            >
              <span>
                {loading
                  ? 'Searching opportunities…'
                  : total > 0
                    ? `Showing ${firstIndex}–${lastIndex} of ${total} results`
                    : 'No matching opportunities right now'}
              </span>
              <Tooltip content="Refresh job listings">
                <button type="button" className="btn btn--sm" onClick={() => reload()} disabled={loading}>
                  Refresh
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>

      <section className="section-full">
        <div className="section-inner">
          <div className="list-container">
            {loading ? (
              <LoadingState label="Loading opportunities…" />
            ) : error ? (
              <Alert>
                {error ?? 'Failed to load jobs.'}{' '}
                <button onClick={reload} className="link">
                  Retry
                </button>
              </Alert>
            ) : jobs.length > 0 ? (
              <div className="list">
                {jobs.map((job, index) => {
                  const salary = formatSalary(job);
                  const isExternal = !!job.isExternal;
                  const company = job.company || job.companyRef?.name || 'Not specified';
                  const location = job.location || (job.city ? `${job.city}` : 'Remote');
                  const isSaved = saved.has(job.id);
                  const isSaving = saving.has(job.id);
                  const matchScore = job.matchScore ?? 0;

                  return (
                    <article
                      key={job.id}
                      className="list-item card--hover mask-reveal"
                      style={{ animationDelay: `${Math.min(index + 1, 4) * 0.05}s` }}
                      onMouseEnter={() => setHovered(job.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div
                            className="list-item__head flex items-start gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="list-item__title m-0">
                                <Link to={`/jobs/${job.id}`} className="link-reset">
                                  {job.title}
                                </Link>
                              </h3>
                              <div className="list-item__meta flex-wrap">
                                <span>{company}</span>
                                <span>{location}</span>
                                <Badge kind={resolveBadgeKind(job.type)}>
                                  {job.type.toLowerCase().replace('_', ' ')}
                                </Badge>
                                {job.workplaceType && (
                                  <span className="text-text-tertiary">
                                    {job.workplaceType === 'ONSITE'
                                      ? 'Work from office'
                                      : job.workplaceType === 'HYBRID'
                                        ? 'Hybrid'
                                        : 'Remote'}
                                  </span>
                                )}
                                {job.experienceLevel && (
                                  <span className="text-text-tertiary">
                                    {labelFor(job.experienceLevel, EXPERIENCE_LEVELS)}
                                  </span>
                                )}
                                {salary && (
                                  <span className="text-text-tertiary">{salary}</span>
                                )}
                              </div>
                            </div>
                            {matchScore > 0 && (
                              <div className="match-score flex-shrink-0" role="progressbar" aria-valuenow={matchScore} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${matchScore}% match score`} aria-label={`Match score ${matchScore}%`}>
                                <div className="match-score__top">
                                  <span>Match</span>
                                  <strong>{Math.round(matchScore)}%</strong>
                                </div>
                                <div className="match-score__track">
                                  <div className="match-score__fill" style={{ width: `${Math.round(matchScore)}%` }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="list-item__meta mt-2 flex-wrap gap-2">
                            {job.workplaceType ? null : (
                              <span className="text-text-tertiary">Remote-friendly</span>
                            )}
                            <span className="text-text-muted text-xs">
                              Posted {formatTimeAgo(job.createdAt)}
                            </span>
                            {isExternal && job.sourceName ? (
                              <span className="text-text-tertiary">
                                Source: {job.sourceName}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0" style={{
                          opacity: hovered === job.id ? 1 : 0.55,
                          transform: hovered === job.id ? 'translateX(0)' : 'translateX(-4px)',
                          transition: 'opacity 0.18s ease, transform 0.18s ease',
                        }}>
                          <Tooltip content={isSaved ? 'Remove from saved jobs' : 'Save this job'}>
                            <Button
                              size="sm"
                              variant={isSaved ? 'primary' : 'ghost'}
                              loading={isSaving}
                              onClick={() => handleSave(job.id)}
                              aria-pressed={isSaved}
                            >
                              {isSaved ? 'Saved' : 'Save'}
                            </Button>
                          </Tooltip>
                          <Tooltip content={isExternal && job.applicationUrl ? 'Apply on the company website' : 'View job details and apply'}>
                             <Button
                               size="sm"
                               variant="secondary"
                               onClick={() => handleApply(job)}
                             >
                               Apply
                             </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No jobs found"
                text={
                  activeFilterCount > 0
                    ? 'Try adjusting your filters or search terms.'
                    : 'No opportunities are available right now. Try again later.'
                }
                action={
                  <div className="flex gap-2">
                    {activeFilterCount > 0 ? (
                      <button type="button" className="btn btn--sm" onClick={clearFilters}>
                        Clear filters
                      </button>
                    ) : null}
                    <button type="button" className="btn btn--sm btn--secondary" onClick={() => reload()}>
                      Refresh
                    </button>
                  </div>
                }
              />
            )}

            {totalPages > 1 && (
              <div
                className="flex items-center justify-center gap-2 mt-6 flex-wrap"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  const visible =
                    pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - page) <= 1;
                  const isEllipsis =
                    visible === false &&
                    pageNumber === (page < totalPages / 2 ? Math.max(2, page + 2) : Math.min(totalPages - 1, page - 2));
                  if (isEllipsis) {
                    return <span key={`e-${i}`} className="text-text-tertiary text-sm">…</span>;
                  }
                  if (!visible) return null;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`btn btn--sm ${pageNumber === page ? 'btn--primary' : 'btn--secondary'} min-w-9`}
                      onClick={() => setPage(pageNumber)}
                      disabled={loading}
                      aria-current={pageNumber === page ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
