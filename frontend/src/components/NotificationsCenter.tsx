import { useState } from 'react';
import { PhosphorIcon } from './PhosphorIcon';
import { LoadingState } from './LoadingState';
import { timeAgo } from '../features/social/lib/format';
import { NOTIFICATION_TABS, notificationTitle, notificationIcon, notificationTabKey } from './notificationsRules';
import type { Notification } from '../core/types';

interface NotificationsCenterProps {
  notifications: Notification[];
  loading?: boolean;
  onOpenNotification: (n: Notification) => void;
}

export const NotificationsCenter = ({ notifications, loading = false, onOpenNotification }: NotificationsCenterProps) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const visible = activeTab === 'all' ? notifications : notifications.filter((n) => notificationTabKey(n) === activeTab);
  const tab = NOTIFICATION_TABS.find((t) => t.key === activeTab);

  return (
    <section className="notif-center" aria-label="Notifications list">
      <div className="notif-center__tabs" role="tablist" aria-label="Notification filters">
        {NOTIFICATION_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            className={`notif-center__tab ${activeTab === t.key ? 'notif-center__tab--active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading notifications…" />
      ) : visible.length > 0 ? (
        <ul className="notif-center__list">
          {visible.map((n) => {
            const unread = !n.read;
            const title = notificationTitle(n);
            return (
              <li
                key={n.id}
                role="listitem"
                aria-label={`Notification: ${title}: ${n.message}`}
                className={`notif-row${unread ? ' notif-row--unread' : ''}`}
                onClick={() => onOpenNotification(n)}
              >
                {unread && <span className="notif-row__dot" aria-label="Unread" />}
                <span className={`notif-row__icon${unread ? ' notif-row__icon--unread' : ''}`}>
                  <PhosphorIcon name={notificationIcon(n) as never} size={18} />
                </span>
                <span className="notif-row__body">
                  <span className="notif-row__title">{title}</span>
                  <span className="notif-row__message">{n.message}</span>
                </span>
                <span className="notif-row__time">{timeAgo(n.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="notif-center__empty">
          <PhosphorIcon name="Bell" size={28} />
          <p>{activeTab === 'all' ? 'No notifications' : `No ${tab?.label.toLowerCase()} notifications`}</p>
          <span className="text-xs text-faint">You&rsquo;re all caught up.</span>
        </div>
      )}
    </section>
  );
};