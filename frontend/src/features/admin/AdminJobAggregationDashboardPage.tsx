import { useAsync } from '../../core/hooks/useAsync';
import { aggregationApi } from '../../core/api/endpoints/aggregation';
import { KPICard } from '../../components/KPICard';
import { DashboardSection } from '../../components/DashboardSection';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { Link } from 'react-router-dom';

export const AdminJobAggregationDashboardPage = () => {
  const { data: stats, loading } = useAsync(() => aggregationApi.dashboard(), []);

  if (loading) {
    return (
      <div className="page fade-in">
        <PageHeader title="Job Aggregation" subtitle="External job discovery and import metrics." />
        <div className="status-strip status-strip--4 section--mt">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton skeleton-text" style={{ width: '60%', height: '0.875rem' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', height: '1.5rem', marginTop: '0.5rem' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page fade-in">
        <EmptyState icon="🤖" title="Aggregation unavailable" text="Job aggregation is not configured." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader title="Job Aggregation" subtitle="External job discovery and import metrics." />

      <div className="status-strip status-strip--4 section--mt">
        <KPICard label="Sources" value={stats.sources.total} icon="📡" hint={`${stats.sources.active} active`} />
        <KPICard label="Discovered today" value={stats.jobs.discoveredToday} icon="🔍" />
        <KPICard label="Imported today" value={stats.jobs.importedToday} icon="📥" />
        <KPICard label="Pending review" value={stats.jobs.pendingReview} icon="⏳" />
      </div>

      <DashboardSection title="Status breakdown" subtitle="Aggregation outcomes." className="section--mt">
        <div className="status-strip status-strip--4">
          <KPICard label="Approved" value={stats.jobs.approved} icon="✅" />
          <KPICard label="Rejected" value={stats.jobs.rejected} icon="❌" />
          <KPICard label="Expired" value={stats.jobs.expired} icon="⌛" />
          <KPICard label="Duplicates" value={stats.jobs.duplicates} icon="🔁" />
        </div>
      </DashboardSection>

      <DashboardSection title="Quick actions" subtitle="Manage aggregation." className="section--mt">
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/admin/job-aggregation/sources"><Button variant="secondary">Manage sources</Button></Link>
          <Link to="/admin/job-aggregation/jobs"><Button variant="secondary">Review jobs</Button></Link>
        </div>
      </DashboardSection>
    </div>
  );
};
