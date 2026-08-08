import { messagesApi } from '../../core/api/endpoints/employers';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import type { Message } from '../../core/types';

export const EmployerMessagesPage = () => {
  const { data: messages, loading } = useRealtimeQuery(() => messagesApi.listMine<Message>(), [], { eventName: 'message' });

  return (
    <div className="page fade-in">
      <h1 className="page-title">Messages</h1>
      <p className="card__subtitle card__subtitle card__subtitle--mt">Conversations with candidates.</p>

      <div className="list" style={{ marginTop: '1.25rem' }}>
        {loading ? (
          <LoadingState label="Loading messages…" />
        ) : messages && messages.length > 0 ? (
          messages.map((m) => (
            <article key={m.id} className="list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{m.from}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="card__subtitle" style={{ marginTop: '0.5rem' }}>{m.body}</p>
            </article>
          ))
        ) : (
          <EmptyState icon="💬" title="No messages yet" text="Messages from candidates will appear here." />
        )}
      </div>
    </div>
  );
};



