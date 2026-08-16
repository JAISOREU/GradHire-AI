import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';

export const AdminNotificationsPage = () => {
  const { data: notifications, loading, reload } = useAsync(() => adminApi.notifications(), []);

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
      <h1 className="page-title page-title--admin">Notifications</h1>
      <AdminListPage
        items={notifications ?? []}
        renderItem={(n) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{n.message}</h3>
                <div className="list-item__meta">
                  <span>{n.recipient?.email}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {!n.read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>Mark read</Button>}
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="🔔"
        emptyTitle="No notifications"
        emptyText="No notifications found."
      />
    </div>
  );
};



