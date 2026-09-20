import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiApi } from '../../core/api/endpoints/ai';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { renderMarkdown } from './markdown';
import {
  appendMessage,
  createConversation,
  loadConversations,
  saveConversations,
  type AssistantConversation,
  type AssistantMessage,
} from './storage';
import { ConversationList } from './components/ConversationList';
import { StarterSuggestions } from './components/StarterSuggestions';
import { CareerContextPanel } from './components/CareerContextPanel';

type JobContext = {
  jobId: string;
  jobTitle?: string;
  jobCompany?: string;
};

const STRIP_JOB_CONTEXT = /^\[Job context:[^\]]*\]\s*/i;
const STRIP_ATTACHMENT = /\[Attachment:[^\]]*\]\s*/i;

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<AssistantConversation[]>(() =>
    loadConversations(user?.id)
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [jobContext, setJobContext] = useState<JobContext | null>(() => {
    const state = (location.state ?? {}) as Partial<JobContext>;
    return state.jobId ? { jobId: state.jobId, jobTitle: state.jobTitle, jobCompany: state.jobCompany } : null;
  });
  const [input, setInput] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversations.length === 0) {
      const fresh = createConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
    } else if (activeId === null || !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[conversations.length - 1].id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    saveConversations(user?.id, conversations);
  }, [conversations, user?.id]);

  useEffect(() => {
    const state = (location.state ?? {}) as Partial<JobContext>;
    setJobContext(state.jobId ? { jobId: state.jobId, jobTitle: state.jobTitle, jobCompany: state.jobCompany } : null);
  }, [location.state]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeId]);

  const patchConversation = useCallback((id: string, patch: (c: AssistantConversation) => AssistantConversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || !activeConversation) return;

      const effective = [
        jobContext ? `[Job context: ${jobContext.jobTitle ?? jobContext.jobId}]` : '',
        attachmentName ? `[Attachment: ${attachmentName}]` : '',
        trimmed,
      ]
        .filter(Boolean)
        .join(' ');

      const userMessage: AssistantMessage = { role: 'user', content: effective, timestamp: new Date().toISOString() };
      const history = activeConversation.messages.map((m) => ({ role: m.role, content: m.content }));

      patchConversation(activeConversation.id, (c) => appendMessage(c, userMessage));
      setInput('');
      setAttachmentName(null);
      setIsLoading(true);
      setError(null);

      try {
        const response = await aiApi.careerChat(effective, history);
        const assistantMessage: AssistantMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp,
        };
        patchConversation(activeConversation.id, (c) => appendMessage(c, assistantMessage));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, activeConversation, jobContext, attachmentName, patchConversation]
  );

  const handleRetry = useCallback(() => {
    const lastUser = activeConversation?.messages
      .filter((m) => m.role === 'user')
      .slice(-1)[0];
    if (!lastUser) return;
    setError(null);
    void sendMessage(lastUser.content.replace(STRIP_JOB_CONTEXT, '').replace(STRIP_ATTACHMENT, ''));
  }, [activeConversation, sendMessage]);

  const handleNewChat = useCallback(() => {
    const fresh = createConversation();
    setConversations((prev) => [...prev, fresh]);
    setActiveId(fresh.id);
    setError(null);
  }, []);

  const handleDelete = useCallback(
    (conversation: AssistantConversation) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== conversation.id);
        if (conversation.id === activeId && next.length > 0) {
          setActiveId(next[next.length - 1].id);
        }
        return next;
      });
      setError(null);
    },
    [activeId]
  );

  const handleSelect = useCallback((conversation: AssistantConversation) => {
    setActiveId(conversation.id);
    setError(null);
  }, []);

  const clearContext = useCallback(() => {
    setJobContext(null);
    navigate('/student/ai-assistant', { replace: true, state: {} });
  }, [navigate]);

  const handleAttachment = (inputEl: HTMLInputElement | null) => {
    if (!inputEl?.files?.length) return;
    setAttachmentName(inputEl.files[0].name);
  };

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Your career copilot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <div className="card p-3">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            onDelete={handleDelete}
          />
        </div>

        <div className="card flex h-[70vh] min-h-0 flex-col overflow-hidden p-0">
          {jobContext && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 text-sm text-primary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                Discussing: {jobContext.jobTitle ?? 'this job'}{jobContext.jobCompany ? ` · ${jobContext.jobCompany}` : ''}
              </span>
              <button
                type="button"
                onClick={clearContext}
                className="ml-auto rounded-full p-1 hover:bg-primary/20 transition-colors"
                aria-label="Clear job context"
              >
                <PhosphorIcon name="X" size={12} weight="bold" />
              </button>
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" data-testid="chat-scroll-area">
            {activeConversation && activeConversation.messages.length > 0 ? (
              <div className="flex flex-col gap-4 px-4 py-6 sm:px-6">
                {activeConversation.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.role}-${i}`}
                  >
                    {msg.role === 'assistant' && (
                      <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <PhosphorIcon name="Sparkle" size={14} weight="fill" />
                      </span>
                    )}
                    <div
                      className={
                        msg.role === 'user'
                          ? 'max-w-[78%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-white'
                          : 'max-w-[82%] rounded-xl bg-surface-muted px-4 py-2.5 text-sm text-text'
                      }
                    >
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start" data-testid="ai-loading">
                    <span className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <PhosphorIcon name="Sparkle" size={14} weight="fill" />
                    </span>
                    <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        Thinking
                        <span className="animate-pulse" aria-hidden="true">…</span>
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert" data-testid="ai-error">
                    <span>{error}</span>
                    <button type="button" className="link ml-auto" onClick={handleRetry}>
                      Retry
                    </button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              !isLoading && (
                <StarterSuggestions
                  onSelect={(prompt) => void sendMessage(prompt)}
                  disabled={isLoading}
                />
              )
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="border-t border-border p-3"
          >
            {attachmentName && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs text-primary">
                <PhosphorIcon name="Paperclip" size={13} />
                <span className="truncate">{attachmentName}</span>
                <button
                  type="button"
                  className="ml-auto rounded-full p-0.5 hover:bg-primary/20"
                  onClick={() => setAttachmentName(null)}
                  aria-label="Remove attachment"
                >
                  <PhosphorIcon name="X" size={12} weight="bold" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                aria-label="Choose file to attach"
                onChange={(e) => handleAttachment(e.target)}
              />
              <button
                type="button"
                className="btn btn--ghost btn--sm mb-1"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach a file"
                data-testid="attach-btn"
              >
                <PhosphorIcon name="Paperclip" size={18} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your career..."
                className="hero-search__input h-10"
                disabled={isLoading}
                aria-label="Ask a career question"
              />
              <button
                type="submit"
                className="btn btn--sm mb-0.5 shrink-0"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                data-testid="send-btn"
              >
                <PhosphorIcon name="ArrowUp" size={16} weight="bold" />
              </button>
            </div>
          </form>
        </div>

        <div className="min-w-0">
          <CareerContextPanel role={user?.role} />
        </div>
      </div>
    </div>
  );
};