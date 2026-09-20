import { PhosphorIcon } from '../../../components/PhosphorIcon';
import {
  conversationTitle,
  formatConversationTime,
  summarizeConversation,
  type AssistantConversation,
} from '../storage';

export type ConversationListProps = {
  conversations: AssistantConversation[];
  activeId: string | null;
  onSelect: (conversation: AssistantConversation) => void;
  onNewChat: () => void;
  onDelete: (conversation: AssistantConversation) => void;
};

export const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
}: ConversationListProps) => (
  <aside className="flex h-full min-h-0 flex-col gap-3" aria-label="Conversations">
    <button
      type="button"
      onClick={onNewChat}
      className="btn btn--primary justify-center gap-2"
      data-testid="new-chat-btn"
    >
      <PhosphorIcon name="Plus" size={15} weight="bold" />
      New chat
    </button>

    {conversations.length === 0 ? (
      <p className="px-2 text-xs text-text-tertiary">No conversations yet.</p>
    ) : (
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" data-testid="conversation-list">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <div
                className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                  active ? 'bg-primary-soft' : 'cursor-pointer hover:bg-surface-muted'
                }`}
                data-testid={`conversation-${c.id}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(c)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(c);
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{conversationTitle(c)}</p>
                  {c.messages.length > 0 && (
                    <p className="truncate text-xs text-text-tertiary">{summarizeConversation(c)}</p>
                  )}
                </div>
                <span className="ml-1 shrink-0 text-[10px] text-text-tertiary">{formatConversationTime(c.updatedAt)}</span>
                <button
                  type="button"
                  className="shrink-0 rounded p-1 text-text-tertiary opacity-0 transition-opacity hover:bg-primary-soft hover:text-primary focus:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete ${conversationTitle(c)}`}
                  data-testid={`delete-conversation-${c.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c);
                  }}
                >
                  <PhosphorIcon name="X" size={12} weight="bold" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </aside>
);