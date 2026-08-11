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

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading messages…" />
        ) : messages && messages.length > 0 ? (
          messages.map((m) => (
            <article key={m.id} className="list-item">
              <div className="flex justify-between items-center">
                <strong>{m.from}</strong>
                <span className="text-xs text-faint">{new Date(m.createdAt).toLocaleString()}</span>
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



