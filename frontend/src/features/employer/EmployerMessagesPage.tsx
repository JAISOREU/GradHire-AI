import { messagesApi } from '../../core/api/endpoints/messages';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Button } from '../../components/Button';
import { FormInput, FormSelect } from '../../components/FormField';
import { Card } from '../../components/Card';
import { useState, useEffect } from 'react';
import type { Message, PaginatedResponse } from '../../core/types';

export const EmployerMessagesPage = () => {
  const { data: messages, loading, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ to: '', body: '' });
  const [candidates, setCandidates] = useState<{ id: string; name: string }[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const loadCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const data = await (await import('../../core/api/endpoints/employers')).employersApi.listApplicants(undefined, 1, 50);
        const unique = Array.from(new Map((data as any[]).map((a) => [a.student?.id, { id: a.student?.id, name: a.student?.profile?.name ?? a.student?.email }])).values());
        setCandidates(unique.filter((c): c is { id: string; name: string } => Boolean(c.id)));
      } catch {
        // ignore
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadCandidates();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to.trim() || !form.body.trim()) return;
    setSending(true);
    setSendError('');
    try {
      await messagesApi.send(form.to.trim(), form.body.trim());
      setForm({ to: '', body: '' });
      reload();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await messagesApi.markRead(id);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title">Messages</h1>
      <p className="card__subtitle card__subtitle--mt">Conversations with candidates.</p>

      <Card title="Send message" className="mt-4">
        <form onSubmit={handleSend} className="stack">
          <FormSelect
            label="Recipient"
            id="msg-to"
            required
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            options={[
              { value: '', label: loadingCandidates ? 'Loading candidates…' : 'Select a candidate' },
              ...candidates.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FormInput label="Message" id="msg-body" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your message…" />
          <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
          {sendError && <div className="message message--error" role="alert">{sendError}</div>}
        </form>
      </Card>

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading messages…" />
        ) : messages && messages.items.length > 0 ? (
          messages.items.map((m: Message) => (
            <article key={m.id} className="list-item">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{m.fromName || m.from}</strong>
                  <span className="text-xs text-faint block">{new Date(m.createdAt).toLocaleString()}</span>
                  {!m.read && <span className="text-xs font-medium text-warning">Unread</span>}
                </div>
                {!m.read && <Button variant="ghost" size="sm" onClick={() => handleMarkRead(m.id)}>Mark read</Button>}
              </div>
              <p className="card__subtitle mt-2">{m.body}</p>
            </article>
          ))
        ) : (
          <EmptyState icon="💬" title="No messages yet" text="Messages from candidates will appear here." />
        )}
      </div>
    </div>
  );
};



