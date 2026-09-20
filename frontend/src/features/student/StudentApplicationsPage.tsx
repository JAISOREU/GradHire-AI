import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { useToast } from '../../core/toast/ToastContext';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { ApplicationDetail } from './components/ApplicationDetail';
import { ApplicationMetrics } from './components/ApplicationMetrics';
import { ApplicationsSidebar } from './components/ApplicationsSidebar';
import { AddApplicationModal } from './components/AddApplicationModal';
import {
  applicationDate,
  computeMetrics,
  computeFunnel,
  countCreatedThisWeek,
  nextStep,
  upcomingInterviews,
  recentActivity,
  recommendedNextSteps,
  statusLabel,
} from './applicationRules';
import type { ApplicationStatus, Application } from '../../core/types';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

type FilterKey = 'ALL' | ApplicationStatus;

const normalizeStatus = (status?: string | null): ApplicationStatus => {
  const s = (status ?? 'SUBMITTED') as ApplicationStatus;
  if (s === 'SHORTLISTED' || s === 'ASSESSMENT') return 'UNDER_REVIEW';
  return s;
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const exportCsv = (applications: Application[]) => {
  const header = 'Company,Role,Date Applied,Stage,Last Update,Next Step';
  const rows = applications.map((app) =>
    [
      app.job?.company ?? 'Unknown',
      app.job?.title ?? 'Unknown',
      formatDate(applicationDate(app)),
      statusLabel(app.status),
      formatDate(app.lastStatusChangeAt ?? applicationDate(app)),
      nextStep(app) ?? '—',
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'applications.csv';
  anchor.click();
  URL.revokeObjectURL(url);
};

const filterPills: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'SUBMITTED', label: 'Applied' },
  { key: 'UNDER_REVIEW', label: 'Screening' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'WITHDRAWN', label: 'Withdrawn' },
];

const SearchInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative w-full">
    <input
      type="search"
      className="input pl-9"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by job title or company"
      aria-label="Search applications by job title or company"
    />
    <PhosphorIcon name="MagnifyingGlass" size={16} weight="regular" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
  </div>
);

const StageBadge = ({ status }: { status: string }) => (
  <Badge kind={resolveBadgeKind(status)}>{statusLabel(status)}</Badge>
);

export const StudentApplicationsPage = () => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [openModal, setOpenModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const { data: applications, loading, error, reload } = useAsync(() => studentsApi.listApplications(1, 200), []);
  const { data: detail, loading: detailLoading, error: detailError, reload: reloadDetail } = useAsync(
    () => (applicationId ? studentsApi.getApplication(applicationId) : Promise.resolve(null)),
    [applicationId],
  );

  const handleWithdraw = async (applicationIdToWithdraw: string) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawError('');
    try {
      await studentsApi.withdraw(applicationIdToWithdraw);
      addToast('success', 'Application withdrawn');
      reload();
      if (applicationId) navigate('/student/applications');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw application.';
      setWithdrawError(message);
      addToast('error', message);
    }
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
          <ApplicationDetail application={detail} onWithdraw={() => void handleWithdraw(detail.id)} />
        ) : null}
      </div>
    );
  }

  const apps = applications ?? [];
  const metrics = computeMetrics(apps);
  const funnel = computeFunnel(apps);
  const weekCount = countCreatedThisWeek(apps);

  const searchLower = search.trim().toLowerCase();
  const filtered = apps
    .filter((app) => filter === 'ALL' || normalizeStatus(app.status) === filter)
    .filter((app) => {
      if (!searchLower) return true;
      return (
        (app.job?.title ?? '').toLowerCase().includes(searchLower) ||
        (app.job?.company ?? '').toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(applicationDate(b)).getTime() - new Date(applicationDate(a)).getTime());

  return (
    <div className="page fade-in">
      <PageHeader
        title="Applications"
        subtitle="Track your job applications from submission to offer."
        actions={
          <>
            <Button onClick={() => setOpenModal(true)}>
              <PhosphorIcon name="Plus" size={14} weight="bold" /> Add Application
            </Button>
            <Button variant="secondary" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0}>
              <PhosphorIcon name="DownloadSimple" size={14} weight="bold" /> Export
            </Button>
          </>
        }
      />

      {error && (
        <Alert>
          {error ?? 'Failed to load applications.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}
      {withdrawError && <Alert>{withdrawError}</Alert>}

      <ApplicationMetrics counts={metrics} createdThisWeek={weekCount} funnel={funnel} />

      <div className="apps-layout section--mt">
        <div className="apps-main">
          <h2 className="section-heading">Your Applications</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                type="button"
                className={`chip chip--filter${filter === pill.key ? ' chip--filter--active' : ''}`}
                onClick={() => setFilter(pill.key)}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <SearchInput value={search} onChange={setSearch} />
          </div>

          {loading ? (
            <Skeleton variant="table" lines={5} />
          ) : filtered.length > 0 ? (
            <>
              <div className="apps-table-desktop">
                <table className="apps-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Date Applied</th>
                      <th>Stage</th>
                      <th>Last Update</th>
                      <th>Next Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((app) => (
                      <tr
                        key={app.id}
                        className="apps-table__row"
                        onClick={() => navigate(`/student/applications/${app.id}`)}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/student/applications/${app.id}`);
                          }
                        }}
                      >
                        <td className="font-semibold">{app.job?.company ?? 'Unknown'}</td>
                        <td>{app.job?.title ?? 'Unknown'}</td>
                        <td>{formatDate(applicationDate(app))}</td>
                        <td><StageBadge status={app.status} /></td>
                        <td>{formatDate(app.lastStatusChangeAt ?? applicationDate(app))}</td>
                        <td className="text-text-secondary">{nextStep(app) ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="apps-cards-mobile">
                {filtered.map((app) => (
                  <article
                    key={app.id}
                    className="apps-card"
                    onClick={() => navigate(`/student/applications/${app.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/student/applications/${app.id}`);
                      }
                    }}
                  >
                    <div className="apps-card__header">
                      <h3 className="apps-card__title">{app.job?.title ?? 'Unknown'}</h3>
                      <StageBadge status={app.status} />
                    </div>
                    <div className="apps-card__body">
                      <span>{app.job?.company ?? 'Unknown'}</span>
                      <span>{formatDate(applicationDate(app))}</span>
                    </div>
                    <div className="apps-card__meta">
                      <span>Updated {formatDate(app.lastStatusChangeAt ?? applicationDate(app))}</span>
                    </div>
                    <div className="apps-card__next">
                      {nextStep(app)}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon="EnvelopeOpen"
              title={searchLower || filter !== 'ALL' ? 'No matching applications' : 'No applications yet'}
              text={searchLower || filter !== 'ALL' ? 'Try adjusting your search terms or filters.' : 'Apply to featured opportunities to track them here.'}
            />
          )}
        </div>
        <ApplicationsSidebar
          upcoming={upcomingInterviews(apps)}
          activity={recentActivity(apps)}
          steps={recommendedNextSteps(apps)}
          totalApplications={apps.length}
        />
      </div>

      <AddApplicationModal
        open={openModal}
        onOpenChange={setOpenModal}
        appliedJobIds={apps.map((a) => a.jobId).filter(Boolean) as string[]}
        onAdded={() => reload()}
      />
    </div>
  );
};