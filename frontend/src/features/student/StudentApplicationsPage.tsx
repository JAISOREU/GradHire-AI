import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { useToast } from '../../core/toast/ToastContext';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { PipelineTracker } from '../../components/PipelineTracker';
import { ApplicationDetail } from './components/ApplicationDetail';
import type { ApplicationStatus, Application } from '../../core/types';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const PIPELINE: { key: ApplicationStatus; label: string }[] = [
  { key: 'SUBMITTED', label: 'Applied' },
  { key: 'UNDER_REVIEW', label: 'In review' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'HIRED', label: 'Hired' },
];

const TERMINAL_STATUSES: ApplicationStatus[] = ['REJECTED', 'WITHDRAWN'];

const keyForStatus = (status?: string | null): ApplicationStatus => {
  const s = (status ?? 'SUBMITTED') as ApplicationStatus;
  if (s === 'SHORTLISTED' || s === 'ASSESSMENT') return 'UNDER_REVIEW';
  return s;
};

const STAGE_ORDER: Record<string, number> = {
  SUBMITTED: 0,
  UNDER_REVIEW: 1,
  INTERVIEW: 2,
  OFFER: 3,
  HIRED: 4,
  REJECTED: 5,
  WITHDRAWN: 5,
};

type FilterKey = 'ALL' | ApplicationStatus;

type SortKey = 'date' | 'status' | 'company';

export const StudentApplicationsPage = () => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const { data: applications, loading, error, reload } = useAsync(() => studentsApi.listApplications(), []);
  const { data: detail, loading: detailLoading, error: detailError, reload: reloadDetail } = useAsync(
    () => (applicationId ? studentsApi.getApplication(applicationId) : Promise.resolve(null)),
    [applicationId]
  );

  const sorters: Record<SortKey, (a: Application, b: Application) => number> = {
    date: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    status: (a, b) => (STAGE_ORDER[keyForStatus(a.status)] ?? 5) - (STAGE_ORDER[keyForStatus(b.status)] ?? 5),
    company: (a, b) => (a.job?.company ?? '').localeCompare(b.job?.company ?? ''),
  };

  const handleWithdraw = async (applicationIdToWithdraw: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    setWithdrawingId(applicationIdToWithdraw);
    setWithdrawError('');

    try {
      await studentsApi.withdraw(applicationIdToWithdraw);
      addToast('success', 'Application withdrawn');
      reload();
      if (applicationId) {
        navigate('/student/applications');
      }
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Failed to withdraw application. Please try again.');
      addToast('error', err instanceof Error ? err.message : 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleDetailWithdraw = async () => {
    if (!detail) return;
    await handleWithdraw(detail.id);
  };

  if (applicationId) {
    return (
      <div className="page fade-in">
        <PageHeader title="Application details" subtitle="Review this application through the hiring pipeline." />
        {detailError && (
          <Alert>
            {detailError ?? 'Failed to load application.'} <button onClick={reloadDetail} className="link">Retry</button>
          </Alert>
        )}
        {detailLoading ? (
          <Skeleton variant="card" lines={8} />
        ) : detail ? (
          <ApplicationDetail application={detail} onWithdraw={handleDetailWithdraw} />
        ) : null}
      </div>
    );
  }

  const counts = new Map<string, number>();
  (applications ?? []).forEach((app) => {
    const k = TERMINAL_STATUSES.includes(app.status as ApplicationStatus) ? app.status : keyForStatus(app.status);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  });

  const searchLower = search.trim().toLowerCase();
  const filtered = (applications ?? [])
    .filter((app) => {
      if (filter === 'ALL') return true;
      const k = TERMINAL_STATUSES.includes(app.status as ApplicationStatus) ? app.status : keyForStatus(app.status);
      return k === filter;
    })
    .filter((app) => {
      if (!searchLower) return true;
      return (
        (app.job?.title ?? '').toLowerCase().includes(searchLower) ||
        (app.job?.company ?? '').toLowerCase().includes(searchLower)
      );
    })
    .sort(sorters[sortBy]);

  const filterPills: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'All' },
    ...PIPELINE.map((stage) => ({ key: stage.key, label: stage.label })),
    { key: 'REJECTED', label: 'Rejected' },
    { key: 'WITHDRAWN', label: 'Withdrawn' },
  ];

  return (
    <div className="page fade-in">
      <PageHeader title="My applications" subtitle="Track every application through the hiring pipeline." />

      {error && (
        <Alert>
          {error ?? 'Failed to load applications.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 section--mt">
        {filterPills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            className={`chip chip--filter${filter === pill.key ? ' chip--filter--active' : ''}`}
            onClick={() => setFilter(pill.key)}
          >
            {pill.label}
            <span className="chip__count">{pill.key === 'ALL' ? (applications?.length ?? 0) : (counts.get(pill.key) ?? 0)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 my-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company"
            aria-label="Search applications by job title or company"
          />
          <PhosphorIcon name="MagnifyingGlass" size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        </div>
        <label className="sr-only" htmlFor="applications-sort">Sort applications</label>
        <select
          id="applications-sort"
          className="select select--auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          aria-label="Sort applications"
        >
          <option value="date">Date</option>
          <option value="status">Status</option>
          <option value="company">Company</option>
        </select>
      </div>

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : filtered.length > 0 ? (
          <div className="list">
            {withdrawError && <Alert>{withdrawError}</Alert>}
            {filtered.map((app) => {
              const terminal = TERMINAL_STATUSES.includes(app.status as ApplicationStatus);
              return (
                <article key={app.id} className="list-item application-item list-item--hover">
                  <div className="list-item__head">
                    <div>
                      <h3 className="list-item__title">
                        <Link to={`/student/applications/${app.id}`} className="hover:text-primary transition-colors">
                          {app.job?.title ?? 'Unknown'} <span className="text-muted">at {app.job?.company ?? 'Unknown'}</span>
                        </Link>
                      </h3>
                      <div className="list-item__meta">
                        <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!terminal && app.status !== 'HIRED' && (
                      <Tooltip content="Withdraw your application for this role">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleWithdraw(app.id)}
                          disabled={withdrawingId === app.id}
                        >
                          {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw'}
                        </Button>
                      </Tooltip>
                    )}
                  </div>

                  <PipelineTracker status={app.status} className="mt-3" />

                  {terminal && (
                    <div className={`application-item__terminal mt-3${app.status === 'REJECTED' ? ' application-item__terminal--rejected' : ''}`}>
                      <PhosphorIcon name={app.status === 'REJECTED' ? 'XCircle' : 'Archive'} size={14} weight="bold" />
                      <span>{app.status === 'REJECTED' ? 'This application was not moved forward.' : 'You withdrew this application.'}</span>
                    </div>
                  )}

                  {app.lastEvent && !terminal && (
                    <div className="text-sm text-secondary section--mt border-l-2 border-border pl-4">
                      <strong>{app.lastEvent.newStatus}</strong> — {app.lastEvent.message || 'Status updated'}
                      <div className="text-xs text-muted">{new Date(app.lastEvent.createdAt).toLocaleString()}</div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="EnvelopeOpen"
            title={searchLower || filter !== 'ALL' ? 'No matching applications' : 'No applications yet'}
            text={searchLower || filter !== 'ALL' ? 'Try adjusting your search terms or filters.' : 'Apply to featured opportunities to track them here.'}
          />
        )}
      </div>
    </div>
  );
};