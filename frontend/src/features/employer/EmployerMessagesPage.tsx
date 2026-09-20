import { useAuth } from '../../core/auth/AuthContext';
import { messagesApi } from '../../core/api/endpoints/messages';
import { employersApi } from '../../core/api/endpoints/employers';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Messenger, EMPLOYER_TABS, type SharedApp } from '../../components/Messenger';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Application, Message, PaginatedResponse } from '../../core/types';

export const EmployerMessagesPage = () => {
  const { user } = useAuth();
  const { data: messages, loading, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string }>>([]);
  const { addToast } = useToast();

  useEffect(() => {
    let alive = true;
    const loadApplicants = async () => {
      try {
        const data = await employersApi.listApplicants(undefined, 1, 50);
        if (!alive) return;
        setApplicants(data);
        const unique = new Map<string, { id: string; name: string }>();
        for (const a of data) {
          const id = a.student?.id;
          if (!id) continue;
          unique.set(id, { id, name: a.student?.profile?.name ?? a.student?.email ?? 'Candidate' });
        }
        setCandidates(Array.from(unique.values()));
      } catch {
        // ignore
      }
    };
    loadApplicants();
    return () => {
      alive = false;
    };
  }, []);

  const sharedApps = useMemo(() => {
    const map: Record<string, SharedApp[]> = {};
    for (const app of applicants) {
      if (!app.student?.id || !app.job?.id) continue;
      (map[app.student.id] ??= []).push({
        id: app.id,
        jobId: app.job.id,
        jobTitle: app.job.title,
        company: app.job.company,
        status: app.status,
        submittedAt: app.submittedAt ?? app.createdAt,
      });
    }
    return map;
  }, [applicants]);

  const handleSearchCandidates = useCallback(async (q: string) => {
    const lower = q.toLowerCase();
    setCandidates((prev) => prev.filter((c) => c.name.toLowerCase().includes(lower)));
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
      <PageHeader title="Messages" subtitle="Conversations with candidates." />
      <Messenger
        messages={messages?.items ?? []}
        currentUserId={user?.id || ''}
        role="EMPLOYER"
        sharedApps={sharedApps}
        tabs={EMPLOYER_TABS}
        onSend={handleSend}
        onMarkRead={handleMarkRead}
        loading={loading}
        reload={reload}
        recipients={candidates}
        onSearchRecipients={handleSearchCandidates}
        getProfileHref={() => '/employer/applications'}
        getJobHref={() => '/employer/jobs'}
      />
    </div>
  );
};