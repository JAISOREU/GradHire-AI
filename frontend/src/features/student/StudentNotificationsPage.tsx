import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { notificationsApi } from '../../core/api/endpoints/notifications';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { studentsApi } from '../../core/api/endpoints/students';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { NotificationsCenter } from '../../components/NotificationsCenter';
import { UpcomingSidebar } from '../../components/UpcomingSidebar';
import { upcomingInterviewsFrom, closingDeadlines } from '../../components/notificationsRules';
import type { Notification } from '../../core/types';

export const StudentNotificationsPage = () => {
  const navigate = useNavigate();
  const { data: notifications, loading, reload } = useRealtimeQuery(
    async () => (await notificationsApi.listMine(1, 100, { includeRead: true })).items ?? [],
    [],
    { eventName: 'notification' },
  );
  const { data: interviews } = useRealtimeQuery(
    async () => (await interviewsApi.getMyInterviews(1, 50)).items ?? [],
    [],
    { eventName: 'notification' },
  );
  const { data: applications } = useRealtimeQuery(
    () => studentsApi.listApplications(1, 50),
    [],
    { eventName: 'notification' },
  );

  const notificationsList = notifications ?? [];
  const hasUnread = notificationsList.some((n) => !n.read);

  const upcoming = useMemo(() => upcomingInterviewsFrom(interviews ?? []), [interviews]);
  const deadlines = useMemo(
    () => closingDeadlines((applications ?? []).map((a) => ({ id: a.job?.id ?? a.id, title: a.job?.title, company: a.job?.company, applicationDeadline: a.job?.applicationDeadline }))),
    [applications],
  );

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      reload();
    } catch {
      // ignore
    }
  };

  const handleOpen = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsApi.markRead(n.id);
        reload();
      } catch {
        // ignore
      }
    }
    if (n.type === 'MESSAGE') {
      navigate('/student/messages');
    } else if (n.job) {
      navigate('/student/applications');
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Notifications"
        subtitle="Updates on your applications, interviews, and matches."
        action={
          <Button variant="ghost" size="sm" disabled={!hasUnread} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        }
      />

      <div className="notifications-layout section--mt">
        <main className="notifications-main">
          <NotificationsCenter notifications={notificationsList} loading={loading} onOpenNotification={handleOpen} />
        </main>
        <UpcomingSidebar interviews={upcoming} deadlines={deadlines} />
      </div>
    </div>
  );
};