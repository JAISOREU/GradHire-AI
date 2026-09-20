import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Message } from '../core/types';
import { Button } from './Button';
import { FormInput } from './FormField';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { PhosphorIcon } from './PhosphorIcon';
import { Badge, resolveBadgeKind } from './Badge';
import {
  buildConversations,
  filterByTab,
  type Conversation,
  type ParticipantKind,
} from './conversationRules';

export type SharedApp = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  submittedAt?: string;
};

export type MessengerTab = {
  key: string;
  label: string;
  kind?: ParticipantKind;
};

export const STUDENT_TABS: MessengerTab[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', kind: 'UNREAD' },
  { key: 'recruiters', label: 'Recruiters', kind: 'RECRUITER' },
  { key: 'companies', label: 'Companies', kind: 'COMPANY' },
];

export const EMPLOYER_TABS: MessengerTab[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread', kind: 'UNREAD' },
  { key: 'candidates', label: 'Candidates', kind: 'CANDIDATE' },
  { key: 'companies', label: 'Companies', kind: 'COMPANY' },
];

const APP_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Applied',
  UNDER_REVIEW: 'Screening',
  SHORTLISTED: 'Screening',
  ASSESSMENT: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

const appStatusLabel = (status: string): string => APP_STATUS_LABELS[status] ?? status;

const EMOJIS = ['👍', '😊', '🎉', '🙏', '💼', '📅', '✨', '✅'];

export type MessengerProps = {
  messages: Message[];
  currentUserId: string;
  role: 'STUDENT' | 'EMPLOYER';
  sharedApps?: Record<string, SharedApp[]>;
  onSend: (to: string, body: string) => Promise<void>;
  onMarkRead?: (messageIds: string[]) => Promise<void>;
  loading?: boolean;
  error?: string;
  reload?: () => void;
  recipients?: Array<{ id: string; name: string }>;
  loadingRecipients?: boolean;
  onSearchRecipients?: (q: string) => Promise<void>;
  newMessageLabel?: string;
  placeholder?: string;
  tabs?: MessengerTab[];
  getProfileHref: (conversation: Conversation) => string;
  getJobHref: (app: SharedApp) => string;
};

const Avatar = ({ name, avatar }: { name: string; avatar: string | null }) => {
  if (avatar) {
    return <img src={avatar} alt="" className="messenger__avatar messenger__avatar-img" />;
  }
  return <div className="messenger__avatar">{name.charAt(0).toUpperCase()}</div>;
};

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

export const Messenger = ({
  messages,
  currentUserId,
  role,
  sharedApps = {},
  onSend,
  onMarkRead,
  loading = false,
  error,
  reload,
  recipients,
  loadingRecipients,
  onSearchRecipients,
  newMessageLabel = 'New message',
  placeholder = 'Write a message…',
  tabs = role === 'EMPLOYER' ? EMPLOYER_TABS : STUDENT_TABS,
  getProfileHref,
  getJobHref,
}: MessengerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>(tabs[0].key);
  const [query, setQuery] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversations = useMemo(() => buildConversations(messages, currentUserId), [messages, currentUserId]);

  const activeTab = useMemo(() => tabs.find((t) => t.key === activeTabKey) ?? tabs[0], [tabs, activeTabKey]);

  const visibleConversations = useMemo(() => {
    const byTab = filterByTab(conversations, activeTab.kind);
    const q = query.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter((c) =>
      `${c.name} ${c.company ?? ''} ${c.subtitle ?? ''}`.toLowerCase().includes(q),
    );
  }, [conversations, activeTab, query]);

  const selectedConvo = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const unreadIds = useMemo(
    () =>
      selectedConvo
        ? selectedConvo.messages
            .filter((m) => m.to === currentUserId && !m.read)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((m) => m.id)
        : [],
    [selectedConvo, currentUserId],
  );

  const selectedMessages = useMemo(() => {
    if (!selectedConvo) return [];
    const list = [...selectedConvo.messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const q = chatQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) => m.body.toLowerCase().includes(q));
  }, [selectedConvo, chatQuery]);

  const panelApps = useMemo(
    () => (selectedId ? sharedApps[selectedId] ?? [] : []),
    [sharedApps, selectedId],
  );

  const sortedPanelApps = useMemo(
    () =>
      [...panelApps].sort(
        (a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime(),
      ),
    [panelApps],
  );

  const currentJob = sortedPanelApps[0] ?? null;
  const detailsRelevant = !!selectedConvo && (!!selectedConvo.company || panelApps.length > 0);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessages]);

  useEffect(() => {
    setBody('');
    setSendError('');
    setShowEmoji(false);
    setChatQuery('');
    setShowChatSearch(false);
    setShowMoreMenu(false);
    if (selectedConvo) inputRef.current?.focus();
  }, [selectedConvo]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (onMarkRead) {
      const convo = conversations.find((c) => c.id === id);
      const ids = convo
        ? convo.messages
            .filter((m) => m.to === currentUserId && !m.read)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((m) => m.id)
        : [];
      if (ids.length > 0) {
        onMarkRead(ids);
      }
    }
  };

  const handleMarkAllRead = () => {
    if (unreadIds.length > 0 && onMarkRead) onMarkRead(unreadIds);
    setShowMoreMenu(false);
  };

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
    if (q.trim().length < 2 || !onSearchRecipients) return;
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

  const handleInsertEmoji = (emoji: string) => {
    setBody((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="messenger">
      {/* Conversation list */}
      <aside className={`messenger__sidebar ${selectedId ? 'messenger__sidebar--hidden' : ''}`}>
        <div className="messenger__sidebar-header">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide m-0">
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
            <div className="mt-2 p-2 border rounded bg-surface-muted">
              <FormInput
                label="To"
                value={newRecipient}
                onChange={(e) => handleNewConversationInput(e.target.value)}
                placeholder="Search…"
                autoComplete="off"
                className="mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleNewConversation}
                disabled={!newRecipient.trim() || loadingRecipients}
                className="w-full"
              >
                {loadingRecipients ? 'Searching…' : 'Search'}
              </Button>
              {recipients && recipients.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto">
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full text-left p-2 rounded cursor-pointer border-0 bg-transparent text-sm text-text"
                      onClick={() => handleSelectRecipient(r.id)}
                    >
                      <div className="font-semibold">{r.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="messenger__search">
            <input
              type="search"
              className="input"
              aria-label="Search conversations"
              placeholder="Search conversations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="messenger__tabs" role="tablist" aria-label="Conversation filters">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab.key === tab.key}
                className={`messenger__tab ${activeTab.key === tab.key ? 'messenger__tab--active' : ''}`}
                onClick={() => setActiveTabKey(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="messenger__conversation-list">
          {loading ? (
            <LoadingState label="Loading conversations…" />
          ) : visibleConversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon="ChatCircle"
                title={conversations.length === 0 ? 'No conversations' : 'No matching conversations'}
                text={
                  conversations.length === 0
                    ? 'Start a new conversation to begin messaging.'
                    : 'Try a different search or tab.'
                }
              />
            </div>
          ) : (
            visibleConversations.map((convo) => (
              <button
                key={convo.id}
                type="button"
                aria-label={`Conversation with ${convo.name}`}
                className={`messenger__conversation ${selectedId === convo.id ? 'messenger__conversation--active' : ''}`}
                onClick={() => handleSelect(convo.id)}
              >
                <Avatar name={convo.name} avatar={convo.avatar} />
                <div className="messenger__conversation-body min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      {convo.name}
                    </span>
                    <span className="text-xs text-muted flex-shrink-0 ml-2">
                      {formatTime(convo.lastMessageAt)}
                    </span>
                  </div>
                  <div className="text-sm text-tertiary overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
                    {convo.lastMessage}
                  </div>
                </div>
                {convo.unreadCount > 0 && (
                  <span className="messenger__unread-badge">{convo.unreadCount}</span>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Active conversation */}
      <section className={`messenger__chat ${selectedId ? 'messenger__chat--open' : ''}`}>
        {selectedId && selectedConvo ? (
          <>
            <header className="messenger__chat-header">
              <Button
                variant="ghost"
                size="sm"
                className="messenger__back"
                aria-label="Back to conversations"
                onClick={() => setSelectedId(null)}
              >
                <PhosphorIcon name="ArrowLeft" size={18} />
              </Button>
              <Avatar name={selectedConvo.name} avatar={selectedConvo.avatar} />
              <div className="messenger__chat-title min-w-0">
                <div className="font-semibold text-sm truncate">{selectedConvo.name}</div>
                {selectedConvo.subtitle && (
                  <div className="text-xs text-tertiary truncate">{selectedConvo.subtitle}</div>
                )}
              </div>
              <div className="messenger__chat-actions">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Search in conversation"
                  onClick={() => setShowChatSearch((v) => !v)}
                >
                  <PhosphorIcon name="MagnifyingGlass" size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="More"
                  onClick={() => setShowMoreMenu((v) => !v)}
                >
                  <PhosphorIcon name="DotsThreeVertical" size={18} />
                </Button>
              </div>
              {showChatSearch && (
                <input
                  type="search"
                  className="input messenger__chat-search"
                  placeholder="Search in conversation…"
                  aria-label="Search in conversation"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  autoFocus
                />
              )}
              {showMoreMenu && (
                <div className="messenger__more-menu">
                  {unreadIds.length > 0 ? (
                    <button type="button" onClick={handleMarkAllRead}>
                      Mark as read
                    </button>
                  ) : (
                    <span className="messenger__more-empty">All messages read</span>
                  )}
                </div>
              )}
            </header>

            <div className="messenger__messages">
              {selectedMessages.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon="ChatCircle"
                    title="No messages yet"
                    text={
                      chatQuery
                        ? 'No messages match your search.'
                        : 'Say hello to start the conversation!'
                    }
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
                        <div
                          className={`messenger__message-time ${isSent ? 'messenger__message-time--sent' : 'messenger__message-time--received'}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {isSent && (
                            <span style={{ marginLeft: '4px', display: 'inline-flex', gap: '2px' }}>
                              <PhosphorIcon name="Check" size={10} weight="bold" />
                              {msg.read && <PhosphorIcon name="Check" size={10} weight="bold" />}
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
                {error} {reload && <Button variant="ghost" size="sm" onClick={reload}>Retry</Button>}
              </div>
            )}
            {sendError && !error && (
              <div className="messenger__error" role="alert">
                {sendError}
              </div>
            )}

            <form onSubmit={handleSend} className="messenger__input-area">
              {showEmoji && (
                <div className="messenger__emoji-popover">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insert emoji ${emoji}`}
                      onClick={() => handleInsertEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                disabled
                title="Attachments coming soon"
                aria-label="Attachment"
                className="messenger__composer-btn"
              >
                <PhosphorIcon name="Paperclip" size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Emoji"
                className="messenger__composer-btn"
                onClick={() => setShowEmoji((v) => !v)}
              >
                <PhosphorIcon name="Smiley" size={18} />
              </Button>
              <input
                ref={inputRef}
                type="text"
                className="input messenger__composer-input"
                placeholder={placeholder}
                aria-label="Compose message"
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
              icon="ChatCircle"
              title="Select a conversation"
              text="Choose a conversation from the sidebar to start chatting."
            />
          </div>
        )}
      </section>

      {/* Details panel */}
      {detailsRelevant && selectedConvo && (
        <aside className="messenger__details" aria-label="Conversation details">
          <div className="messenger__details-header">
            <h3 className="text-sm font-semibold m-0">Details</h3>
            <Button
              variant="ghost"
              size="sm"
              aria-label={detailsCollapsed ? 'Expand details' : 'Collapse details'}
              onClick={() => setDetailsCollapsed((v) => !v)}
            >
              <PhosphorIcon name={detailsCollapsed ? 'ArrowLeft' : 'CaretDown'} size={16} />
            </Button>
          </div>
          {!detailsCollapsed && (
            <>
              <div className="messenger__details-company">
                <Avatar name={selectedConvo.company ?? selectedConvo.name} avatar={selectedConvo.avatar} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {selectedConvo.company ?? selectedConvo.name}
                  </div>
                  {selectedConvo.subtitle && (
                    <div className="text-xs text-tertiary">{selectedConvo.subtitle}</div>
                  )}
                </div>
              </div>

              {currentJob && (
                <section className="messenger__details-section">
                  <h4 className="messenger__details-title">Current Job</h4>
                  <div className="messenger__details-job">
                    <span className="font-medium text-sm">{currentJob.jobTitle}</span>
                    <Badge kind={resolveBadgeKind(currentJob.status)}>
                      {appStatusLabel(currentJob.status)}
                    </Badge>
                  </div>
                </section>
              )}

              {sortedPanelApps.length > 1 && (
                <section className="messenger__details-section">
                  <h4 className="messenger__details-title">Shared Applications</h4>
                  <ul className="messenger__details-apps">
                    {sortedPanelApps.slice(1).map((app) => (
                      <li key={app.id} className="messenger__details-app">
                        <span className="text-sm truncate">
                          {app.jobTitle}
                          <span className="text-tertiary"> · {app.company}</span>
                        </span>
                        <Badge kind={resolveBadgeKind(app.status)}>
                          {appStatusLabel(app.status)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="messenger__details-actions">
                <a href={getProfileHref(selectedConvo)} className="btn btn--primary">
                  View Profile
                </a>
                {currentJob && (
                  <a href={getJobHref(currentJob)} className="btn btn--ghost">
                    View Job
                  </a>
                )}
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  );
};