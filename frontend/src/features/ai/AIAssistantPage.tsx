import { useState, useRef, useEffect, useCallback, Fragment, type ReactNode } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiApi } from '../../core/api/endpoints/ai';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import { ProductAIStyles } from '../landing/visuals/ProductAI';
import { AIInsightPanel, ConversationBubble, SuggestedPrompts, AIStateIndicator, TrustBadge } from '../landing/visuals/ProductAI';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
  timestamp?: string;
};

type JobContext = {
  jobId: string;
  jobTitle?: string;
  jobCompany?: string;
};

const DEFAULT_PROMPTS = [
  'What jobs fit my current skills?',
  'What skills should I improve?',
  'Why am I a strong match for this job?',
  'How can I improve my resume?',
];

const JOB_PROMPTS = [
  'How do I match this job?',
  'What skills am I missing for this role?',
  'What should I highlight in my application?',
];

const storageKey = (userId: string) => `graduate-ai-chat:${userId}`;

const readStored = (userId: string | undefined): ChatMessage[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    );
  } catch {
    return [];
  }
};

const renderInline = (text: string, keyBase: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const parts = text.split(/(`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code key={`${keyBase}-code-${i}`} className="rounded bg-surface-muted px-1 py-0.5 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
      return;
    }
    part.split(/(\*\*[^*]+\*\*)/g).forEach((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
        nodes.push(<strong key={`${keyBase}-bold-${i}-${j}`}>{seg.slice(2, -2)}</strong>);
        return;
      }
      nodes.push(<Fragment key={`${keyBase}-txt-${i}-${j}`}>{seg}</Fragment>);
    });
  });
  return nodes;
};

const renderMarkdown = (text: string): ReactNode[] => {
  const blocks: ReactNode[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  let blockKey = 0;
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      const key = blockKey++;
      blocks.push(
        <p key={`p-${key}`} className="my-1.5">
          {renderInline(paragraph.join(' '), `p-${key}`)}
        </p>
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const key = blockKey++;
      blocks.push(
        <ul key={`ul-${key}`} className="my-1.5 pl-4 list-disc">
          {listItems.map((item, idx) => (
            <li key={`li-${key}-${idx}`} className="text-sm">
              {renderInline(item, `li-${key}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      flushParagraph();
      flushList();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre key={`pre-${blockKey++}`} className="my-1.5 overflow-x-auto rounded bg-surface-muted p-2.5 text-xs font-mono whitespace-pre-wrap">
          {code.join('\n')}
        </pre>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line.trim())) {
      flushParagraph();
      listItems.push(line.trim().replace(/^[-*]\s+/, ''));
      i += 1;
      continue;
    }

    flushList();

    if (line.trim() === '') {
      flushParagraph();
    } else {
      paragraph.push(line.trim());
    }
    i += 1;
  }
  flushParagraph();
  flushList();

  return blocks;
};

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>(() => readStored(user?.id));
  const [jobContext, setJobContext] = useState<JobContext | null>(() => {
    const state = (location.state ?? {}) as Partial<JobContext>;
    return state.jobId ? { jobId: state.jobId, jobTitle: state.jobTitle, jobCompany: state.jobCompany } : null;
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiState, setAiState] = useState<'ready' | 'processing' | 'failed'>('ready');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = (location.state ?? {}) as Partial<JobContext>;
    setJobContext(state.jobId ? { jobId: state.jobId, jobTitle: state.jobTitle, jobCompany: state.jobCompany } : null);
  }, [location.state]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(messages));
    } catch {
      /* storage unavailable */
    }
  }, [messages, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const effective = jobContext ? `[Job context: ${jobContext.jobTitle ?? jobContext.jobId}] ${text.trim()}` : text.trim();

      const userMessage: ChatMessage = { role: 'user', content: effective, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setAiState('processing');
      setError(null);

      try {
        const conversationHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await aiApi.careerChat(effective, conversationHistory);
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setAiState('ready');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
        setAiState('failed');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, jobContext, messages]
  );

  const clearContext = useCallback(() => {
    setJobContext(null);
    navigate('/student/ai-assistant', { replace: true, state: {} });
  }, [navigate]);

  const handleRetry = () => {
    setAiState('ready');
    setError(null);
  };

  const prompts = jobContext ? JOB_PROMPTS : DEFAULT_PROMPTS;

  return (
    <div className="ai-assistant-page">
      <ProductAIStyles />
      <div className="ai-assistant-page__inner">
        <div className="ai-assistant-page__header">
          <h1 className="ai-assistant-page__title">AI Career Assistant</h1>
          <p className="ai-assistant-page__subtitle">
            Ask questions about your career, skills, and opportunities
          </p>
          <TrustBadge level="ai-generated" label="AI-generated insight" />
        </div>

        <div className="ai-assistant-page__content">
          {jobContext && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
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

          {messages.length === 0 && !isLoading && (
            <div className="ai-assistant-page__empty">
              <AIInsightPanel title="Career Assistant" badge="Ready to help">
                <p className="text-sm text-text-secondary mb-4">
                  {jobContext
                    ? 'I can help you get ready for this role — matching, skill gaps, and application highlights.'
                    : 'I can help you with career advice, job matching, skill development, and more.'}
                </p>
                <SuggestedPrompts
                  prompts={prompts}
                  onSelect={(prompt) => {
                    setInput(prompt);
                    void sendMessage(prompt);
                  }}
                />
              </AIInsightPanel>
            </div>
          )}

          {messages.length > 0 && (
            <div className="ai-assistant-page__messages">
              {messages.map((msg, i) => (
                <ConversationBubble
                  key={i}
                  role={msg.role}
                  content={msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {isLoading && (
                <div className="ai-assistant-page__loading">
                  <AIStateIndicator state="processing" message="Thinking..." />
                </div>
              )}
              {error && aiState === 'failed' && (
                <div className="ai-assistant-page__error">
                  <AIStateIndicator state="failed" message={error} onRetry={handleRetry} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="ai-assistant-page__input-area">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage(input);
              }}
              className="ai-assistant-page__form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a career question..."
                className="ai-assistant-page__input"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="ai-assistant-page__send"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
