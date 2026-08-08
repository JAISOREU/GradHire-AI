import { messagesApi } from '../../core/api/endpoints/employers';
import { useRealtimeQuery } from '../../core/hooks/useRealtimeQuery';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import type { Message } from '../../core/types';

export const StudentMessagesPage = () => {
  const { data: messages, loading } = useRealtimeQuery(() => messagesApi.listMine<Message>(), [], { eventName: 'message' });

  return (
    <div className="page fade-in">
      <h1 className="page-title">Messages</h1>
      <p className="card__subtitle card__subtitle--mt">Conversations with employers.</p>

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading messages…" />
        ) : messages && messages.length > 0 ? (
          messages.map((m) => (
            <article key={m.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{m.from}</h3>
                  <div className="list-item__meta">
                    <span className="text-faint text-sm">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="card__subtitle section--mt">{m.body}</p>
            </article>
          ))
        ) : (
          <EmptyState icon="💬" title="No messages yet" text="When employers reach out, conversations will appear here." />
        )}
      </div>
    </div>
  );
};
