import { messagesApi } from '../../core/api/endpoints/messages';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { Card } from '../../components/Card';
import { Tooltip } from '../../components/Tooltip';
import { useState } from 'react';
import type { Message, PaginatedResponse } from '../../core/types';

export const StudentMessagesPage = () => {
  const { data: messages, loading, error, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ to: '', body: '' });
  const [sendError, setSendError] = useState('');
  const { addToast } = useToast();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to.trim() || !form.body.trim()) return;
    setSending(true);
    setSendError('');
    const previousBody = form.body;
    const previousTo = form.to;

    try {
      await messagesApi.send(form.to.trim(), form.body.trim());
      setForm({ to: '', body: '' });
      addToast('success', 'Message sent');
      reload();
    } catch (err) {
      setForm({ to: previousTo, body: previousBody });
      setSendError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
      addToast('error', err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await messagesApi.markRead(id);
      addToast('success', 'Message marked as read');
      reload();
    } catch {
      addToast('error', 'Failed to mark message as read');
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Messages" subtitle="Conversations with employers." />

      <Card title="Send message" className="section--mt">
        <form onSubmit={handleSend} className="stack">
          <Tooltip content="Enter the employer's user ID">
            <FormInput label="Recipient ID" id="msg-to" required value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder="Employer user ID" />
          </Tooltip>
          <Tooltip content="Write your message to the employer">
            <FormInput label="Message" id="msg-body" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your message…" />
          </Tooltip>
          <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
          {sendError && <div className="message message--error" role="alert">{sendError}</div>}
        </form>
      </Card>

      <div className="section--mt">
        <h2 className="section-title">Inbox</h2>
        {error && (
          <div className="message message--error" role="alert">
            {error ?? 'Failed to load messages.'} <button onClick={reload} className="link">Retry</button>
          </div>
        )}
        <div className="list-container">
          {loading ? (
            <LoadingState label="Loading messages…" />
          ) : messages && messages.items.length > 0 ? (
            messages.items.map((m: Message) => (
              <article key={m.id} className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{m.fromName || m.from}</h3>
                    <div className="list-item__meta">
                      <span className="text-faint text-sm">{new Date(m.createdAt).toLocaleString()}</span>
                      {!m.read && <span className="text-xs font-medium text-warning">Unread</span>}
                    </div>
                  </div>
                  {!m.read && (
                    <Tooltip content="Mark this message as read">
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(m.id)}>Mark read</Button>
                    </Tooltip>
                  )}
                </div>
                <p className="card__subtitle section--mt">{m.body}</p>
              </article>
            ))
          ) : (
            <EmptyState icon="💬" title="No messages yet" text="When employers reach out, conversations will appear here." />
          )}
        </div>
      </div>
    </div>
  );
};
