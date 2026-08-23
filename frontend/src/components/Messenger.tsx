import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Message } from '../core/types';
import { Button } from './Button';
import { FormInput } from './FormField';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
};

type MessengerProps = {
  messages: Message[];
  currentUserId: string;
  onSend: (to: string, body: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  reload?: () => void;
  recipients?: Array<{ id: string; name: string }>;
  loadingRecipients?: boolean;
  onSearchRecipients?: (q: string) => Promise<void>;
  newMessageLabel?: string;
  searchPlaceholder?: string;
};

export const Messenger = ({
  messages,
  currentUserId,
  onSend,
  loading,
  error,
  reload,
  recipients,
  loadingRecipients,
  onSearchRecipients,
  newMessageLabel = 'New message',
  searchPlaceholder = 'Search conversations…',
}: MessengerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [filter, setFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversations = useMemo<Conversation[]>(() => {
    const map = new Map<string, Conversation>();

    for (const msg of messages) {
      const otherId = msg.from === currentUserId ? msg.to : msg.from;
      const otherName =
        msg.from === currentUserId
          ? msg.toName || msg.to
          : msg.fromName || msg.from;

      if (!map.has(otherId)) {
        map.set(otherId, {
          id: otherId,
          name: otherName,
          lastMessage: msg.body,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          messages: [],
        });
      }

      const convo = map.get(otherId)!;
      convo.messages.push(msg);

      const msgTime = new Date(msg.createdAt).getTime();
      const convoTime = new Date(convo.lastMessageAt).getTime();
      if (msgTime > convoTime) {
        convo.lastMessage = msg.body;
        convo.lastMessageAt = msg.createdAt;
      }

      if (msg.to === currentUserId && !msg.read) {
        convo.unreadCount += 1;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [messages, currentUserId]);

  const filteredConversations = useMemo(() => {
    if (!filter.trim()) return conversations;
    const q = filter.toLowerCase();
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, filter]);

  const selectedMessages = useMemo(() => {
    if (!selectedId) return [];
    const convo = conversations.find((c) => c.id === selectedId);
    if (!convo) return [];
    return convo.messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [selectedId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  useEffect(() => {
    if (selectedId) {
      setBody('');
      setSendError('');
      inputRef.current?.focus();
    }
  }, [selectedId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !selectedId) return;
    setSending(true);
    setSendError('');
    try {
      await onSend(selectedId, body.trim());
      setBody('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNewConversation = useCallback(async () => {
    if (!newRecipient.trim() || !onSearchRecipients) return;
    setSendError('');
    try {
      await onSearchRecipients(newRecipient.trim());
    } catch {
      setSendError('Failed to find recipient');
    }
  }, [newRecipient, onSearchRecipients]);

  const handleNewConversationInput = useCallback(async (q: string) => {
    setNewRecipient(q);
    if (q.trim().length < 2 || !onSearchRecipients) {
      return;
    }
    setSendError('');
    try {
      await onSearchRecipients(q.trim());
    } catch {
      setSendError('Failed to find recipient');
    }
  }, [onSearchRecipients]);

  const handleSelectRecipient = (id: string) => {
    setSelectedId(id);
    setShowNewMessage(false);
    setNewRecipient('');
  };

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="messenger">
      <div className="messenger__sidebar">
        <div className="messenger__sidebar-header">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide" style={{ margin: 0 }}>
              Messages
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewMessage(!showNewMessage)}
              aria-label={newMessageLabel}
            >
              + New
            </Button>
          </div>
          {showNewMessage && (
            <div className="mt-2 p-2 border rounded" style={{ background: 'var(--color-surface-muted)' }}>
              <FormInput
                label="To"
                value={newRecipient}
                onChange={(e) => handleNewConversationInput(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleNewConversation}
                disabled={!newRecipient.trim() || loadingRecipients}
                style={{ width: '100%' }}
              >
                {loadingRecipients ? 'Searching…' : 'Search'}
              </Button>
              {recipients && recipients.length > 0 && (
                <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full text-left p-2 rounded cursor-pointer border-0"
                      style={{
                        background: 'transparent',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text)',
                      }}
                      onClick={() => handleSelectRecipient(r.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <input
            type="search"
            className="input mt-2"
            placeholder={searchPlaceholder}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="messenger__conversation-list">
          {loading ? (
            <LoadingState label="Loading conversations…" />
          ) : filteredConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="💬"
                title="No conversations"
                text="Start a new conversation to begin messaging."
              />
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <button
                key={convo.id}
                type="button"
                className={`messenger__conversation ${selectedId === convo.id ? 'messenger__conversation--active' : ''}`}
                onClick={() => setSelectedId(convo.id)}
              >
                <div className="messenger__avatar">
                  {convo.name.charAt(0).toUpperCase()}
                </div>
                <div className="messenger__conversation-body" style={{ minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {convo.name}
                    </span>
                    <span className="text-xs text-faint" style={{ flexShrink: 0, marginLeft: 'var(--space-2)' }}>
                      {formatTime(convo.lastMessageAt)}
                    </span>
                  </div>
                  <div className="text-sm text-tertiary" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '2px'
                  }}>
                    {convo.lastMessage}
                  </div>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="messenger__unread-badge">
                    {convo.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="messenger__chat">
        {selectedId && selectedConvo ? (
          <>
            <div className="messenger__chat-header">
              <div className="flex items-center gap-2">
                <div className="messenger__avatar" style={{ width: '32px', height: '32px', fontSize: 'var(--text-sm)' }}>
                  {selectedConvo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{selectedConvo.name}</div>
                </div>
              </div>
            </div>

            <div className="messenger__messages">
              {selectedMessages.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon="👋"
                    title="No messages yet"
                    text="Say hello to start the conversation!"
                  />
                </div>
              ) : (
                selectedMessages.map((msg) => {
                  const isSent = msg.from === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`messenger__message-wrapper ${isSent ? 'messenger__message-wrapper--sent' : 'messenger__message-wrapper--received'}`}
                    >
                      <div
                        className={`messenger__message ${isSent ? 'messenger__message--sent' : 'messenger__message--received'}`}
                      >
                        <div>{msg.body}</div>
                        <div className={`messenger__message-time ${isSent ? 'messenger__message-time--sent' : 'messenger__message-time--received'}`}>
                          {formatMessageTime(msg.createdAt)}
                          {isSent && (
                            <span style={{ marginLeft: '4px' }}>
                              {msg.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="messenger__error" role="alert">
                {error} {reload && <button onClick={reload} className="link">Retry</button>}
              </div>
            )}
            {sendError && !error && (
              <div className="messenger__error" role="alert">
                {sendError}
              </div>
            )}

            <form onSubmit={handleSend} className="messenger__input-area">
              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Type a message…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
                autoComplete="off"
              />
              <Button type="submit" disabled={sending || !body.trim()}>
                {sending ? 'Sending…' : 'Send'}
              </Button>
            </form>
          </>
        ) : (
          <div className="messenger__empty">
            <EmptyState
              icon="💬"
              title="Select a conversation"
              text="Choose a conversation from the sidebar to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
};
