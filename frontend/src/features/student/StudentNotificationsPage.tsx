import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';

export const StudentNotificationsPage = () => {
  const { data: notifications, loading, reload } = useRealtimeQuery(() => notificationsApi.listMine(), [], { eventName: 'notification' });

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Notifications" subtitle="Updates on your applications and matches." />

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <article key={n.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{n.message}</h3>
                  <div className="list-item__meta">
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {!n.read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>Mark read</Button>}
              </div>
              {n.job && (
                <p className="text-muted text-sm section--mt">
                  {n.job.title} at {n.job.company}
                </p>
              )}
            </article>
          ))
        ) : (
          <EmptyState icon="Bell" title="No notifications" text="You're all caught up." />
        )}
      </div>
    </div>
  );
};
