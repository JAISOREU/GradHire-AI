import { messagesApi } from '../../core/api/endpoints/messages';
import { companiesApi } from '../../core/api/endpoints/companies';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { useToast } from '../../core/toast/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { FormInput } from '../../components/FormField';
import { Card } from '../../components/Card';
import { Tooltip } from '../../components/Tooltip';
import { useState, useMemo } from 'react';
import type { Message, PaginatedResponse } from '../../core/types';

export const StudentMessagesPage = () => {
  const { data: messages, loading, error, reload } = useRealtimeQuery(() => messagesApi.listMine(), [] as PaginatedResponse<Message>[], { eventName: 'message' });
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ to: '', body: '' });
  const [sendError, setSendError] = useState('');
  const [employerSearch, setEmployerSearch] = useState('');
  const [employers, setEmployers] = useState<Array<{ id: string; name: string; industry?: string; location?: string }>>([]);
  const { addToast } = useToast();

  const selectedEmployer = useMemo(() => employers.find((e) => e.id === form.to), [employers, form.to]);

  const handleSearchEmployers = async (q: string) => {
    setEmployerSearch(q);
    if (q.trim().length < 2) {
      setEmployers([]);
      return;
    }
    try {
      const data = await companiesApi.searchEmployers(q.trim());
      setEmployers(data.items ?? []);
    } catch {
      setEmployers([]);
    }
  };

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
      setEmployers([]);
      setEmployerSearch('');
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
          <div style={{ position: 'relative' }}>
            <Tooltip content="Search for an employer by company name">
              <FormInput
                label="To"
                id="msg-to"
                required
                value={selectedEmployer ? selectedEmployer.name : employerSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmployerSearch(val);
                  setForm({ ...form, to: val });
                  handleSearchEmployers(val);
                }}
                placeholder="Search company name..."
                autoComplete="off"
              />
            </Tooltip>
            {employers.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {employers.map((employer) => (
                  <button
                    key={employer.id}
                    type="button"
                    style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: form.to === employer.id ? 'var(--color-primary-soft)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}
                    onClick={() => {
                      setForm({ ...form, to: employer.id });
                      setEmployerSearch(employer.name);
                      setEmployers([]);
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = form.to === employer.id ? 'var(--color-primary-soft)' : 'transparent'; }}
                  >
                    <div style={{ fontWeight: 600 }}>{employer.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {employer.industry} {employer.location ? `· ${employer.location}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
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
