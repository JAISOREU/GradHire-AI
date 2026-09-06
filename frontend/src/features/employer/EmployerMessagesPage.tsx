import { useAuth } from '../../core/auth/AuthContext';
import { messagesApi } from '../../core/api/endpoints/messages';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Messenger } from '../../components/Messenger';
import { useState, useEffect, useCallback } from 'react';
import type { Message, PaginatedResponse } from '../../core/types';

export const EmployerMessagesPage = () => {
  const { user } = useAuth();
  const { data: messages, loading, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [candidates, setCandidates] = useState<Array<{ id: string; name: string }>>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { employersApi } = await import('../../core/api/endpoints/employers');
        const data = await employersApi.listApplicants(undefined, 1, 50);
        const unique = Array.from(new Map(data.map((a) => [a.student?.id, { id: a.student?.id, name: a.student?.profile?.name ?? a.student?.email }])).values());
        setCandidates(unique.filter((c): c is { id: string; name: string } => Boolean(c.id)));
      } catch {
        // ignore
      }
    };
    loadCandidates();
  }, []);

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

  return (
    <div className="page fade-in">
      <PageHeader title="Messages" subtitle="Conversations with candidates." />
      <Messenger
        messages={messages?.items ?? []}
        currentUserId={user?.id || ''}
        onSend={handleSend}
        loading={loading}
        recipients={candidates}
        onSearchRecipients={handleSearchCandidates}
        searchPlaceholder="Search candidates…"
      />
    </div>
  );
};
