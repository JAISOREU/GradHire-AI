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
import type { ApplicationStatus } from '../../core/types';
import { useState } from 'react';

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

type FilterKey = 'ALL' | ApplicationStatus;

const StageTracker = ({ status }: { status?: string | null }) => {
  if (!status || TERMINAL_STATUSES.includes(status as ApplicationStatus)) {
    return null;
  }
  const current = keyForStatus(status);
  const currentIndex = PIPELINE.findIndex((stage) => stage.key === current);
  if (currentIndex < 0) return null;

  return (
    <div className="stage-tracker mt-3" aria-label={`Pipeline stage ${currentIndex + 1} of ${PIPELINE.length}`}>
      {PIPELINE.map((stage, idx) => (
        <div
          key={stage.key}
          className={`stage-tracker__step${idx <= currentIndex ? ' stage-tracker__step--on' : ''}${idx === currentIndex ? ' stage-tracker__step--current' : ''}`}
        >
          <span className="stage-tracker__dot" />
          <span className="stage-tracker__label">{stage.label}</span>
          {idx < PIPELINE.length - 1 && <span className="stage-tracker__connector" />}
        </div>
      ))}
    </div>
  );
};

export const StudentApplicationsPage = () => {
  const { data: applications, loading, error, reload } = useAsync(() => studentsApi.listApplications(), []);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const { addToast } = useToast();

  const counts = new Map<string, number>();
  (applications ?? []).forEach((app) => {
    const k = TERMINAL_STATUSES.includes(app.status as ApplicationStatus) ? app.status : keyForStatus(app.status);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  });

  const filtered = (applications ?? []).filter((app) => {
    if (filter === 'ALL') return true;
    const k = TERMINAL_STATUSES.includes(app.status as ApplicationStatus) ? app.status : keyForStatus(app.status);
    return k === filter;
  });

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }
    setWithdrawingId(applicationId);
    setWithdrawError('');

    try {
      await studentsApi.withdraw(applicationId);
      addToast('success', 'Application withdrawn');
      reload();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'Failed to withdraw application. Please try again.');
      addToast('error', err instanceof Error ? err.message : 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const filterPills: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'All' },
    ...PIPELINE.map((stage) => ({ key: stage.key, label: stage.label })),
    { key: 'REJECTED', label: 'Rejected' },
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

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : filtered.length > 0 ? (
          <div className="list">
            {withdrawError && <Alert>{withdrawError}</Alert>}
            {filtered.map((app) => {
              const terminal = TERMINAL_STATUSES.includes(app.status as ApplicationStatus);
              return (
                <article key={app.id} className="list-item application-item">
                  <div className="list-item__head">
                    <div>
                      <h3 className="list-item__title">
                        {app.job?.title ?? 'Unknown'} <span className="text-muted">at {app.job?.company ?? 'Unknown'}</span>
                      </h3>
                      <div className="list-item__meta">
                        <Badge kind={resolveBadgeKind(app.status)}>{app.status}</Badge>
                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {!terminal && app.status !== 'HIRED' && (
                      <Tooltip content="Withdraw your application for this role">
                        <Button variant="ghost" size="sm" onClick={() => handleWithdraw(app.id)} disabled={withdrawingId === app.id}>
                          {withdrawingId === app.id ? 'Withdrawing…' : 'Withdraw'}
                        </Button>
                      </Tooltip>
                    )}
                  </div>

                  <StageTracker status={app.status} />

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
          <EmptyState icon="EnvelopeOpen" title={filter === 'ALL' ? 'No applications yet' : 'No applications in this stage'} text={filter === 'ALL' ? 'Apply to featured opportunities to track them here.' : 'Applications you move to this stage will appear here.'} />
        )}
      </div>
    </div>
  );
};