import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { useAsync } from '../../core/hooks/useAsync';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { MorphingText } from '../../components/MorphingText';
import { PageHeader } from '../../components/PageHeader';
import { Tooltip } from '../../components/Tooltip';
import type { JobType, ExperienceLevel, WorkplaceType } from '../../core/types';

const JOB_TYPES: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  { value: 'HIRING', label: 'Hiring' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel | ''; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'NO_EXPERIENCE', label: 'No experience' },
  { value: 'ENTRY_LEVEL', label: 'Entry level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID_LEVEL', label: 'Mid level' },
  { value: 'SENIOR', label: 'Senior' },
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
  { value: 'title', label: 'Featured' },
];

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

export const JobListPage = () => {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<JobType | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | ''>('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const preview = !isAuthenticated;
  const limit = preview ? 3 : 20;

  const { data, loading, reload } = useAsync(
    () =>
      jobsApi.listPaginated({
        search: search || undefined,
        type: type || undefined,
        experienceLevel: experienceLevel || undefined,
        workplaceType: workplaceType || undefined,
        city: city || undefined,
        sort: sortBy,
        page,
        limit,
      }),
    [search, type, experienceLevel, workplaceType, city, sortBy, page, limit],
  );

  useEffect(() => {
    setPage(1);
  }, [search, type, experienceLevel, workplaceType, city, sortBy]);

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const firstIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastIndex = Math.min(page * limit, total);

  return (
    <div className="public-page">
      <section className="section-full">
        <div className="section-inner">
          <PageHeader
            title={<MorphingText text="Find the career you always wanted" as="span" />}
            action={
              preview ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">
                    Showing a preview
                  </span>
                  <Link to="/register">
                    <Button size="sm">Sign up to see all</Button>
                  </Link>
                </div>
              ) : undefined
            }
          />
        </div>
      </section>

      {preview && (
        <section className="section-full">
          <div className="section-inner">
            <div className="card p-4 bg-primary-soft border border-primary">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="m-0 font-semibold text-primary">
                    Unlock full access
                  </p>
                  <p className="text-sm mt-1 text-text-secondary">
                    Sign up to browse all opportunities, save jobs, and track your applications.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to="/login"><Button size="sm" variant="secondary">Log in</Button></Link>
                  <Link to="/register"><Button size="sm">Create account</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-full">
        <div className="section-inner">
          <div className="card section--mt p-5">
            <div className="filter-bar flex-wrap">
              {!preview && (
                <>
                  <Tooltip content="Search by job title, company, or skills">
                      <input
                        className="input flex-[1_1_240px]"
                        type="search"
                        placeholder="Search jobs, companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                  </Tooltip>
                  <Tooltip content="Filter by location">
                      <input
                        className="input flex-[1_1_160px]"
                        type="text"
                        placeholder="Location"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                  </Tooltip>
                </>
              )}
              {!preview && (
                <>
                  <select
                    className="select select--auto"
                    value={type}
                    onChange={(e) => setType(e.target.value as JobType | '')}
                  >
                    {JOB_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    className="select select--auto"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | '')}
                  >
                    {EXPERIENCE_LEVELS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    className="select select--auto"
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType | '')}
                  >
                    {WORKPLACE_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    className="select select--auto"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm text-text-secondary">
                {preview
                  ? `Previewing ${jobs.length} of ${total} opportunities`
                  : `Showing ${firstIndex}–${lastIndex} of ${total} results`}
              </span>
              {!preview && (
                <div className="flex gap-2">
                  <Tooltip content="Refresh job listings">
                    <button className="btn btn--sm" onClick={() => reload()} disabled={loading}>
                      Refresh
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-full">
        <div className="section-inner">
          <div className="list-container">
            {loading ? (
              <LoadingState label="Loading opportunities…" />
            ) : jobs.length > 0 ? (
              <div className="list">
                {jobs.map((job, index) => {
                  const salary = formatSalary(job);
                  const isExternal = !!job.isExternal;
                  const company = job.company || job.companyRef?.name || 'Not specified';
                  const location = job.location || 'Remote';
                  return (
                    <article key={job.id} className={`list-item card--hover mask-reveal mask-reveal--delay-${Math.min(index + 1, 4)}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="list-item__title m-0">
                              <Link to={`/jobs/${job.id}`} className="link-reset">
                                {job.title}
                              </Link>
                            </h3>
                            {isExternal && (
                              <span className="badge badge--external bg-info-soft text-info">
                                External Listing
                              </span>
                            )}
                          </div>
                          <div className="list-item__meta flex-wrap">
                            <span>{company}</span>
                            <span>{location}</span>
                            <Badge kind={resolveBadgeKind(job.type)}>
                              {job.type === 'INTERNSHIP' ? 'Internship' : job.type?.toLowerCase().replace('_', ' ') ?? 'Hiring'}
                            </Badge>
                            {job.workplaceType && (
                              <span className="text-text-tertiary">
                                {job.workplaceType === 'ONSITE' ? 'Work from office' : job.workplaceType === 'HYBRID' ? 'Hybrid' : 'Remote'}
                              </span>
                            )}
                            {job.experienceLevel && (
                              <span className="text-text-tertiary">
                                {job.experienceLevel.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            )}
                            {salary && (
                              <span className="text-text-tertiary">
                                {salary}
                              </span>
                            )}
                            <span className="text-text-muted">{formatTimeAgo(job.createdAt)}</span>
                          </div>
                            {isExternal && job.sourceName && (
                              <div className="mt-2 text-sm text-text-secondary flex items-center gap-2 flex-wrap">
                                <span>Source: <span className="font-semibold">{job.sourceName}</span></span>
                              {job.applicationUrl && (
                                <Link to={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="btn btn--sm btn--secondary" onClick={(e) => e.stopPropagation()}>
                                  Apply on Original Site
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState iconName="jobs" title="No jobs found" text="Try adjusting your filters or search terms." />
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button className="btn btn--secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </button>
              <span className="self-center text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button className="btn btn--secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
