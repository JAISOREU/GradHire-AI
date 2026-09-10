import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { KPICard } from '../../components/KPICard';
import { getRoleLabel } from '../../core/utils/roleLabels';
import { DashboardSection } from '../../components/DashboardSection';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { currentPeriodLabel } from '../../core/utils/format';

export const AdminDashboardPage = () => {
  const { data: stats, loading } = useAsync(() => adminApi.dashboard(), []);

  if (loading) {
    return (
      <div className="page fade-in">
        <PageHeader title="Admin Dashboard" subtitle="Platform overview and key metrics." />
        <div className="status-strip status-strip--4 section--mt">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="profile" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page fade-in">
        <EmptyState icon="ChartBar" title="No data available" text="Dashboard metrics are being collected." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader title="Admin Dashboard" subtitle={`Platform overview \u00b7 ${currentPeriodLabel()}`} />

      <div className="status-strip status-strip--hero section--mt">
        <KPICard
          className="kpi-card--primary"
          label="Total users"
          value={stats.users}

          action={
            <Link to="/admin/users"><Button variant="ghost" size="sm">Manage</Button></Link>
          }
        />
        <KPICard
          label="Active jobs"
          value={stats.activeJobs}

          trend={{ direction: 'up', value: `${stats.activeJobs} open`, label: 'listings' }}
          action={
            <Link to="/admin/jobs"><Button variant="ghost" size="sm">Review</Button></Link>
          }
        />
        <KPICard
          label="Applications"
          value={stats.applicationsToday}

          trend={{ direction: 'up', value: `${stats.applicationsToday} today`, label: 'submissions' }}
          action={
            <Link to="/admin/applications"><Button variant="ghost" size="sm">View</Button></Link>
          }
        />
        <KPICard
          className="kpi-card--wide"
          label="Unread notifications"
          value={stats.notificationsUnread}

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
          <KPICard label={getRoleLabel('STUDENT')} value={stats.students}  />
          <KPICard label="Employers" value={stats.employers}  />
          <KPICard label="Total users" value={stats.users} />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        subtitle="Common admin tasks."
        className="section--mt"
      >
        <div className="flex gap-3 flex-wrap">
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
