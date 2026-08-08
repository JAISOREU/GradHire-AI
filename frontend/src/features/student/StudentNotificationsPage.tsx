import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';

export const StudentNotificationsPage = () => {
  const { data: notifications, loading } = useRealtimeQuery(() => notificationsApi.listMine(), [], { eventName: 'notification' });

  return (
    <div className="page fade-in">
      <PageHeader title="Notifications" subtitle="Updates on your applications and matches." />

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <article key={n.id} className="list-item">
              <p className="card__subtitle">{n.message}</p>
              {n.job && (
                <p className="text-muted text-sm section--mt">
                  {n.job.title} at {n.job.company}
                </p>
              )}
              <p className="text-faint text-sm section--mt">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </article>
          ))
        ) : (
          <EmptyState icon="🔔" title="No notifications" text="You're all caught up." />
        )}
      </div>
    </div>
  );
};
