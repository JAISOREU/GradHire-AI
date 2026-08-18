import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { KPICard } from '../../components/KPICard';
import { getRoleLabel } from '../../core/utils/roleLabels';
import { DashboardSection } from '../../components/DashboardSection';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';

export const AdminDashboardPage = () => {
  const { data: stats, loading } = useAsync(() => adminApi.dashboard(), []);

  if (loading) {
    return (
      <div className="page fade-in">
        <PageHeader title="Admin Dashboard" subtitle="Platform overview and key metrics." />
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
        <EmptyState icon="📊" title="No data available" text="Dashboard metrics are being collected." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and key metrics." />

      <div className="status-strip status-strip--4 section--mt">
        <KPICard
          label="Total users"
          value={stats.users}
          icon="👥"
          trend={{ direction: 'up', value: `${stats.students + stats.employers}`, label: 'active accounts' }}
          action={
            <Link to="/admin/users"><Button variant="ghost" size="sm">Manage</Button></Link>
          }
        />
        <KPICard
          label="Active jobs"
          value={stats.activeJobs}
          icon="🗂️"
          trend={{ direction: 'up', value: `${stats.activeJobs} open`, label: 'listings' }}
          action={
            <Link to="/admin/jobs"><Button variant="ghost" size="sm">Review</Button></Link>
          }
        />
        <KPICard
          label="Applications"
          value={stats.applicationsToday}
          icon="📨"
          trend={{ direction: 'up', value: `${stats.applicationsToday} today`, label: 'submissions' }}
          action={
            <Link to="/admin/applications"><Button variant="ghost" size="sm">View</Button></Link>
          }
        />
        <KPICard
          label="Unread notifications"
          value={stats.notificationsUnread}
          icon="🔔"
          trend={{ direction: stats.notificationsUnread > 0 ? 'down' : 'up', value: stats.notificationsUnread > 0 ? 'Needs attention' : 'All caught up', label: 'status' }}
          action={
            <Link to="/admin/notifications"><Button variant="ghost" size="sm">Check</Button></Link>
          }
        />
      </div>

      <DashboardSection
        title="Platform breakdown"
        subtitle="User distribution and engagement."
        className="section--mt"
      >
        <div className="status-strip status-strip--3">
          <KPICard label={getRoleLabel('STUDENT')} value={stats.students} icon="🎓" />
          <KPICard label="Employers" value={stats.employers} icon="🏢" />
          <KPICard label="Total users" value={stats.users} icon="👥" />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        subtitle="Common admin tasks."
        className="section--mt"
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/admin/users"><Button variant="secondary">Manage users</Button></Link>
          <Link to="/admin/jobs"><Button variant="secondary">Review jobs</Button></Link>
          <Link to="/admin/applications"><Button variant="secondary">View applications</Button></Link>
          <Link to="/admin/audit-logs"><Button variant="ghost">Audit logs</Button></Link>
          <Link to="/admin/settings"><Button variant="ghost">System settings</Button></Link>
        </div>
      </DashboardSection>
    </div>
  );
};
