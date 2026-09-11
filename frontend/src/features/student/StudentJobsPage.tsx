import { Alert } from '../../components/Alert';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { useToast } from '../../core/toast/ToastContext';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { FilterPill } from '../../components/FilterPill';
import { JobCard } from '../../components/JobCard';
import { JobFeedTabs } from '../../components/JobFeedTabs';
import { LoadingState } from '../../components/LoadingState';
import { NLSearchInput } from '../../components/NLSearchInput';
import { PageHeader } from '../../components/PageHeader';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { Tooltip } from '../../components/Tooltip';
import { JobDetailPanel } from './JobDetailPanel';
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
  { value: 'salaryMin', label: 'Highest salary' },
];

const FEED_TABS: { key: string; label: string }[] = [
  { key: 'best', label: 'Best Match' },
  { key: 'recent', label: 'Recently Posted' },
  { key: 'closing', label: 'Closing Soon' },
  { key: 'saved', label: 'Saved' },
];

const PAGE_SIZE = 20;

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

  const [search, setSearch] = useState('');
  const [type, setType] = useState<JobType | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType | ''>('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [feedTab, setFeedTab] = useState('recent');
  const [nlMode, setNlMode] = useState(false);

  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    const onMediaChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener('change', onMediaChange);
    return () => mq.removeEventListener('change', onMediaChange);
  }, []);

  const activeFilterCount = useMemo(
    () => [type, experienceLevel, workplaceType, city, search].filter(Boolean).length,
    [type, experienceLevel, workplaceType, city, search],
  );

  const activeFilterPills = useMemo(() => {
    const pills: { label: string; key: string }[] = [];
    if (search) pills.push({ key: 'search', label: `Search: ${search}` });
    if (city) pills.push({ key: 'city', label: `Location: ${city}` });
    if (type) pills.push({ key: 'type', label: `Type: ${labelFor(type, JOB_TYPES)}` });
    if (experienceLevel) pills.push({ key: 'experienceLevel', label: `Level: ${labelFor(experienceLevel, EXPERIENCE_LEVELS)}` });
    if (workplaceType) pills.push({ key: 'workplaceType', label: `Workplace: ${labelFor(workplaceType, WORKPLACE_TYPES)}` });
    return pills;
  }, [search, city, type, experienceLevel, workplaceType]);

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

  const jobs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const savedCount = saved.size;
  const selectedJob = useMemo(() => jobs.find((j) => j.id === selectedId) ?? null, [jobs, selectedId]);

  const feedItems = useMemo(() => {
    if (feedTab === 'saved') return jobs.filter((j) => saved.has(j.id));
    if (feedTab === 'best') {
      return [...jobs].sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    }
    if (feedTab === 'closing') {
      return [...jobs].sort((a, b) => {
        const da = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : Infinity;
        const db = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : Infinity;
        return da - db;
      });
    }
    return jobs;
  }, [feedTab, jobs, saved]);

  const displayTotal = feedTab === 'saved' ? feedItems.length : total;

  const tabs = useMemo(
    () => FEED_TABS.map((tab) => (tab.key === 'saved' ? { ...tab, count: savedCount } : tab)),
    [savedCount],
  );

  useEffect(() => {
    if (selectedId && !jobs.some((j) => j.id === selectedId)) {
      setSelectedId(null);
    }
  }, [jobs, selectedId]);

  useEffect(() => {
    if (!selectedId || !isMobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedId, isMobile]);

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

  const clearFilters = () => {
    setSearch('');
    setType('');
    setExperienceLevel('');
    setWorkplaceType('');
    setCity('');
    setSortBy('createdAt');
  };

  const removeFilter = (key: string) => {
    switch (key) {
      case 'search':
        setSearch('');
        break;
      case 'city':
        setCity('');
        break;
      case 'type':
        setType('');
        break;
      case 'experienceLevel':
        setExperienceLevel('');
        break;
      case 'workplaceType':
        setWorkplaceType('');
        break;
    }
  };

  const handleNlParse = (parsed: { keywords: string[]; location: string; experience: string; workplace: string }) => {
    if (parsed.keywords.length > 0) setSearch(parsed.keywords.join(' '));
    if (parsed.location) setCity(parsed.location);
    if (parsed.experience) {
      if (parsed.experience === 'MID') setExperienceLevel('MID_LEVEL');
      else if (parsed.experience === 'JUNIOR' || parsed.experience === 'SENIOR') setExperienceLevel(parsed.experience);
    }
    if (parsed.workplace === 'REMOTE' || parsed.workplace === 'HYBRID' || parsed.workplace === 'ONSITE') {
      setWorkplaceType(parsed.workplace);
    }
  };

  const handleFeedTabChange = (key: string) => {
    setFeedTab(key);
    setPage(1);
  };

  const displayFirstIndex = displayTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const displayLastIndex = Math.min(page * PAGE_SIZE, displayTotal);

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
          <div className="browse-shell">
            <div className="card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <JobFeedTabs
                  tabs={tabs}
                  active={feedTab}
                  onChange={handleFeedTabChange}
                  className="flex-1"
                />
                <Tooltip content={nlMode ? 'Show the structured filter bar' : 'Search with natural language'}>
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary whitespace-nowrap flex-shrink-0"
                    onClick={() => setNlMode((m) => !m)}
                    aria-pressed={nlMode}
                  >
                    <PhosphorIcon name={nlMode ? 'Sliders' : 'MagicWand'} size={14} weight="bold" />
                    {nlMode ? 'Basic filters' : 'AI search'}
                  </button>
                </Tooltip>
              </div>

              <div className="mt-3">
                {nlMode ? (
                  <NLSearchInput
                    onParse={handleNlParse}
                    className="w-full"
                  />
                ) : (
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
                )}
              </div>

              {activeFilterPills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeFilterPills.map((pill) => (
                    <FilterPill
                      key={pill.key}
                      label={pill.label}
                      onRemove={() => removeFilter(pill.key)}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap text-sm text-text-secondary">
                <span>
                  {loading
                    ? 'Searching opportunities…'
                    : displayTotal > 0
                      ? `Showing ${displayFirstIndex}–${displayLastIndex} of ${displayTotal} results`
                      : 'No matching opportunities right now'}
                </span>
                <Tooltip content="Refresh job listings">
                  <button type="button" className="btn btn--sm" onClick={() => reload()} disabled={loading}>
                    Refresh
                  </button>
                </Tooltip>
              </div>
            </div>

            {error ? (
              <Alert className="browse-shell__error">
                {error ?? 'Failed to load jobs.'}{' '}
                <button onClick={reload} className="link">
                  Retry
                </button>
              </Alert>
            ) : loading ? (
              <div className="browse-shell__loading">
                <LoadingState label="Loading opportunities…" />
              </div>
            ) : jobs.length === 0 ? (
              <EmptyState
                className="browse-shell__error"
                title="No opportunities found"
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
            ) : feedItems.length === 0 ? (
              <EmptyState
                className="browse-shell__error"
                title={feedTab === 'saved' ? 'No saved jobs on this page' : 'No matching results'}
                text={
                  feedTab === 'saved'
                    ? 'Save jobs to build your shortlist. Saved jobs appear here.'
                    : 'Try switching feeds or adjusting your filters.'
                }
                action={
                  <button type="button" className="btn btn--sm" onClick={() => reload()}>
                    Refresh
                  </button>
                }
              />
            ) : (
              <div className="browse-panes">
                <aside className="browse-list" aria-label="Job results">
                  {feedItems.map((job) => {
                    const isSelected = selectedId === job.id;

                    return (
                      <JobCard
                        key={job.id}
                        job={{
                          id: job.id,
                          title: job.title,
                          company: job.company || job.companyRef?.name || 'Not specified',
                          location: job.location || (job.city ? job.city : 'Remote'),
                          salary: formatSalary(job),
                          workplaceType: job.workplaceType,
                          experienceLevel: job.experienceLevel,
                          matchScore: job.matchScore,
                          postedAt: job.createdAt,
                          deadline: job.applicationDeadline,
                          isSaved: saved.has(job.id),
                          isApplied: appliedIds.has(job.id),
                        }}
                        selected={isSelected}
                        onClick={() => setSelectedId(job.id)}
                        onToggleSave={() => handleSave(job.id)}
                        className={`browse-list__item${isSelected ? ' is-selected' : ''}`}
                      />
                    );
                  })}

                  {totalPages > 1 && (
                    <div className="browse-list__pagination">
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
                </aside>

                <section className="browse-detail" aria-label="Job details">
                  {!isMobile &&
                    (selectedId ? (
                      <JobDetailPanel
                        key={selectedId}
                        jobId={selectedId}
                        matchScore={selectedJob?.matchScore ?? 0}
                        saved={saved.has(selectedId)}
                        saving={saving.has(selectedId)}
                        applied={appliedIds.has(selectedId)}
                        onToggleSave={() => handleSave(selectedId)}
                        onApplied={() => setAppliedIds((prev) => new Set(prev).add(selectedId))}
                      />
                    ) : (
                      <div className="browse-detail__empty">
                        <EmptyState
                          icon="Briefcase"
                          title="Select a job"
                          text="Choose a role from the list to see full details and apply."
                        />
                      </div>
                    ))}
                </section>
              </div>
            )}
          </div>
        </div>
      </section>

      {isMobile && selectedId && (
        <div className="browse-drawer" role="dialog" aria-modal="true" aria-label="Job details">
          <header className="browse-drawer__header">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setSelectedId(null)}
              aria-label="Back to results"
            >
              <PhosphorIcon name="ArrowLeft" size={16} weight="bold" />
              <span>Back</span>
            </button>
            <span className="text-sm text-text-secondary">Job details</span>
          </header>
          <div className="browse-drawer__body">
            <JobDetailPanel
              key={selectedId}
              jobId={selectedId}
              matchScore={selectedJob?.matchScore ?? 0}
              saved={saved.has(selectedId)}
              saving={saving.has(selectedId)}
              applied={appliedIds.has(selectedId)}
              onToggleSave={() => handleSave(selectedId)}
              onApplied={() => setAppliedIds((prev) => new Set(prev).add(selectedId))}
            />
          </div>
        </div>
      )}
    </div>
  );
};