import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Button } from '../../components/Button';

export const EmployerNotificationsPage = () => {
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
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">Updates on applicants and your postings.</p>

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <article key={n.id} className="list-item">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-base">{n.message}</p>
                  {n.job && (
                    <p className="text-sm text-muted mt-1">
                      {n.job.title} at {n.job.company}
                    </p>
                  )}
                  <p className="text-xs text-faint mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>Mark read</Button>}
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No notifications" text="You're all caught up." />
        )}
      </div>
    </div>
  );
};



