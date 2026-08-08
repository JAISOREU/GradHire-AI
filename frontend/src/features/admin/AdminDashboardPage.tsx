import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { StatCard } from '../../components/StatCard';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export const AdminDashboardPage = () => {
  const { data: stats, loading } = useAsync(() => adminApi.dashboard(), []);

  if (loading) {
    return <div className="page fade-in"><LoadingState label="Loading admin dashboard…" /></div>;
  }

  if (!stats) {
    return (
      <div className="page fade-in">
        <EmptyState icon="🛡️" title="Admin access required" text="You do not have permission to view this page." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Dashboard</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Platform overview and key metrics.</p>

      <div className="status-strip" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '1.25rem' }}>
        <StatCard label="Total Users" value={stats.users} icon="👥" />
        <StatCard label="Students" value={stats.students} icon="🎓" />
        <StatCard label="Employers" value={stats.employers} icon="🏢" />
        <StatCard label="Active Jobs" value={stats.activeJobs} icon="🗂️" />
        <StatCard label="Applications" value={stats.applicationsToday} icon="📨" />
        <StatCard label="Unread Notifications" value={stats.notificationsUnread} icon="🔔" />
      </div>
    </div>
  );
};
