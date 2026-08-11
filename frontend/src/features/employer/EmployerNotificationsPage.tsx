import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerNotificationsPage = () => {
  const { data: notifications, loading } = useRealtimeQuery(() => notificationsApi.listMine(), [], { eventName: 'notification' });

  return (
    <div className="page fade-in">
      <h1 className="page-title">Notifications</h1>
      <p className="card__subtitle card__subtitle card__subtitle--mt">Updates on applicants and your postings.</p>

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <article key={n.id} className="list-item">
              <p className="text-base">{n.message}</p>
              {n.job && (
                <p className="text-sm text-muted mt-1">
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



