import { useAuth } from '../../core/auth/AuthContext';
import { messagesApi } from '../../core/api/endpoints/messages';
import { companiesApi } from '../../core/api/endpoints/companies';
import { studentsApi } from '../../core/api/endpoints/students';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Messenger, type SharedApp } from '../../components/Messenger';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Application, Message, PaginatedResponse } from '../../core/types';

const toSharedApp = (app: Application): SharedApp | null => {
  const employerId = app.job?.employerId;
  if (!employerId || !app.job?.id) return null;
  return {
    id: app.id,
    jobId: app.job.id,
    jobTitle: app.job.title,
    company: app.job.company,
    status: app.status,
    submittedAt: app.submittedAt ?? app.createdAt,
  };
};

export const StudentMessagesPage = () => {
  const { user } = useAuth();
  const { data: messages, loading, error, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [applications, setApplications] = useState<Application[]>([]);
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const { addToast } = useToast();

  useEffect(() => {
    let alive = true;
    studentsApi
      .listApplications(1, 50)
      .then((apps) => {
        if (alive) setApplications(apps);
      })
      .catch(() => {
        // apps unavailable — right panel just shows company info
      });
    return () => {
      alive = false;
    };
  }, []);

  const sharedApps = useMemo(() => {
    const map: Record<string, SharedApp[]> = {};
    for (const app of applications) {
      const shared = toSharedApp(app);
      const employerId = app.job?.employerId;
      if (!shared || !employerId) continue;
      (map[employerId] ??= []).push(shared);
    }
    return map;
  }, [applications]);

  const handleSearchEmployers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setEmployers([]);
      return;
    }
    const data = await companiesApi.searchEmployers(q.trim());
    setEmployers((data.items ?? []).map((c) => ({ id: c.id, name: c.name })));
  }, []);

  const handleSend = async (to: string, body: string) => {
    try {
      await messagesApi.send(to, body);
      addToast('success', 'Message sent');
      reload();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleMarkRead = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => messagesApi.markRead(id)));
      reload();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to mark messages read');
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Messages" subtitle="Conversations with employers." />
      <Messenger
        messages={messages?.items ?? []}
        currentUserId={user?.id || ''}
        role="STUDENT"
        sharedApps={sharedApps}
        onSend={handleSend}
        onMarkRead={handleMarkRead}
        loading={loading}
        error={error ?? undefined}
        reload={reload}
        recipients={employers}
        onSearchRecipients={handleSearchEmployers}
        getProfileHref={() => '/student/companies'}
        getJobHref={() => '/student/jobs'}
      />
    </div>
  );
};