import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { useAsync } from '../../core/hooks/useAsync';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { MorphingText } from '../../components/MorphingText';
import { PageHeader } from '../../components/PageHeader';
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
  const [search, setSearch] = useState('');
  const [type, setType] = useState<JobType | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | ''>('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

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
        limit: 20,
      }),
    [search, type, experienceLevel, workplaceType, city, sortBy, page]
  );

  useEffect(() => {
    setPage(1);
  }, [search, type, experienceLevel, workplaceType, city, sortBy]);

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="page fade-in">
      <PageHeader
        title={<MorphingText text="Find the career you always wanted" as="span" />}
      />

      <div className="card section--mt" style={{ padding: 'var(--space-5)' }}>
        <div className="filter-bar">
          <input
            className="input"
            type="search"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 240px' }}
          />
          <input
            className="input"
            type="text"
            placeholder="Location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ flex: '1 1 160px' }}
          />
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
        </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Showing {total} of {total} results
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn--sm" onClick={() => reload()} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>
      </div>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                        <h3 className="list-item__title" style={{ margin: 0 }}>
                          <Link to={`/jobs/${job.id}`} className="link-reset" style={{ color: 'inherit' }}>
                            {job.title}
                          </Link>
                        </h3>
                        {isExternal && (
                          <span className="badge badge--external" style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)' }}>
                            External Listing
                          </span>
                        )}
                      </div>
                      <div className="list-item__meta" style={{ flexWrap: 'wrap' }}>
                        <span>{company}</span>
                        <span>{location}</span>
                        <Badge kind={resolveBadgeKind(job.type)}>
                          {job.type === 'INTERNSHIP' ? 'Internship' : job.type?.toLowerCase().replace('_', ' ') ?? 'Hiring'}
                        </Badge>
                        {job.workplaceType && (
                          <span style={{ color: 'var(--color-text-tertiary)' }}>
                            {job.workplaceType === 'ONSITE' ? 'Work from office' : job.workplaceType === 'HYBRID' ? 'Hybrid' : 'Remote'}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span style={{ color: 'var(--color-text-tertiary)' }}>
                            {job.experienceLevel.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        )}
                        {salary && (
                          <span style={{ color: 'var(--color-text-tertiary)' }}>
                            {salary}
                          </span>
                        )}
                        <span style={{ color: 'var(--color-text-muted)' }}>{formatTimeAgo(job.createdAt)}</span>
                      </div>
                      {isExternal && job.sourceName && (
                        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <span>Source: <span style={{ fontWeight: 600 }}>{job.sourceName}</span></span>
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button className="btn btn--secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span style={{ alignSelf: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn--secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};
