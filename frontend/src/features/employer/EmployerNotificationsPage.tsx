import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerNotificationsPage = () => {
  const { data: notifications, loading } = useRealtimeQuery(() => notificationsApi.listMine(), [], { eventName: 'notification' });

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notifications</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Updates on applicants and your postings.</p>

      <div className="list" style={{ marginTop: '1.25rem' }}>
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <article key={n.id} className="list-item">
              <p style={{ fontSize: '0.95rem' }}>{n.message}</p>
              {n.job && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                  {n.job.title} at {n.job.company}
                </p>
              )}
            </article>
          ))
        ) : (
          <EmptyState icon="🔔" title="No notifications" text="You're all caught up." />
        )}
      </div>
    </div>
  );
};
