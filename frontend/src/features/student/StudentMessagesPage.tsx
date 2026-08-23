import { useAuth } from '../../core/auth/AuthContext';
import { messagesApi } from '../../core/api/endpoints/messages';
import { companiesApi } from '../../core/api/endpoints/companies';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Messenger } from '../../components/Messenger';
import { useState, useCallback } from 'react';
import type { Message, PaginatedResponse } from '../../core/types';

export const StudentMessagesPage = () => {
  const { user } = useAuth();
  const { data: messages, loading, error, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const { addToast } = useToast();

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

  return (
    <div className="page fade-in">
      <PageHeader title="Messages" subtitle="Conversations with employers." />
      <Messenger
        messages={messages?.items ?? []}
        currentUserId={user?.id || ''}
        onSend={handleSend}
        loading={loading}
        error={error ?? undefined}
        reload={reload}
        recipients={employers}
        onSearchRecipients={handleSearchEmployers}
        searchPlaceholder="Search employers…"
      />
    </div>
  );
};
