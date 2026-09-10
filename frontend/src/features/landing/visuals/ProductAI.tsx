import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { PhosphorIcon, type PhosphorIconName } from '../../../components/PhosphorIcon';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================
   AIInsightPanel — reusable AI insight container
   ============================================================ */

interface AIInsightPanelProps {
  title: string;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}

export const AIInsightPanel = ({ title, children, badge, className = '' }: AIInsightPanelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className={`product-ai-panel ${className}`.trim()}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="product-ai-panel__chrome"
      >
        <div className="product-ai-panel__header">
          <div className="product-ai-panel__header-left">
            <span className="product-ai-panel__icon" aria-hidden="true">AI</span>
            <span className="product-ai-panel__title">{title}</span>
          </div>
          {badge && <span className="product-ai-panel__badge">{badge}</span>}
        </div>
        <div className="product-ai-panel__body">{children}</div>
      </motion.div>
    </div>
  );
};

/* ============================================================
   MatchExplanation — AI match score breakdown
   ============================================================ */

interface MatchExplanationProps {
  score: number;
  strengths: string[];
  missing: string[];
  explanation: string;
  recommendations: string[];
}

export const MatchExplanation = ({ score, strengths, missing, explanation, recommendations }: MatchExplanationProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="product-ai-match">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="product-ai-match__inner"
      >
        {/* Score header */}
        <div className="product-ai-match__header">
          <div className="product-ai-match__score">{score}%</div>
          <div className="product-ai-match__label">Match</div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="product-ai-match__section">
            <div className="product-ai-match__section-title">Strong alignment</div>
            <div className="product-ai-match__divider" />
            <ul className="product-ai-match__list">
              {strengths.map((item) => (
                <li key={item} className="product-ai-match__item product-ai-match__item--matched">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing */}
        {missing.length > 0 && (
          <div className="product-ai-match__section">
            <div className="product-ai-match__section-title">Potential gaps</div>
            <div className="product-ai-match__divider" />
            <ul className="product-ai-match__list">
              {missing.map((item) => (
                <li key={item} className="product-ai-match__item product-ai-match__item--missing">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div className="product-ai-match__section">
          <div className="product-ai-match__section-title">Why this score?</div>
          <div className="product-ai-match__divider" />
          <p className="product-ai-match__explanation">{explanation}</p>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="product-ai-match__section">
            <div className="product-ai-match__section-title">Recommended next step</div>
            <div className="product-ai-match__divider" />
            <ul className="product-ai-match__list">
              {recommendations.map((item) => (
                <li key={item} className="product-ai-match__item product-ai-match__item--recommendation">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ============================================================
   RAGSources — visual context indicators
   ============================================================ */

interface RAGSourcesProps {
  sources: string[];
  className?: string;
}

export const RAGSources = ({ sources, className = '' }: RAGSourcesProps) => {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className={`product-ai-rag ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="product-ai-rag__trigger"
        aria-expanded={expanded}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Based on {sources.length} sources</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <motion.ul
          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, ease: EASE }}
          className="product-ai-rag__list"
        >
          {sources.map((source) => (
            <li key={source} className="product-ai-rag__item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {source}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

/* ============================================================
   AIStateIndicator — processing / ready / failed states
   ============================================================ */

type AIState = 'indexing' | 'processing' | 'ready' | 'failed' | 'no-info';

interface AIStateIndicatorProps {
  state: AIState;
  message?: string;
  onRetry?: () => void;
}

export const AIStateIndicator = ({ state, message, onRetry }: AIStateIndicatorProps) => {
  const reduceMotion = useReducedMotion();

  const stateConfig: Record<AIState, { label: string; icon: PhosphorIconName; color: string }> = {
    indexing: { label: 'Preparing your resume...', icon: 'FileText', color: 'var(--color-text-tertiary)' },
    processing: { label: 'Analyzing your career profile...', icon: 'GearSix', color: 'var(--color-primary)' },
    ready: { label: 'AI insights ready', icon: 'CheckCircle', color: 'var(--color-success)' },
    failed: { label: message || "We couldn't analyze your document. Try again.", icon: 'Warning', color: '#ef4444' },
    'no-info': { label: message || "I couldn't find enough information to answer this confidently.", icon: 'Question', color: 'var(--color-text-tertiary)' },
  };

  const config = stateConfig[state];

  return (
    <div className={`product-ai-state product-ai-state--${state}`.trim()}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="product-ai-state__inner"
      >
        <div className="product-ai-state__icon" style={{ color: config.color }}>
          {state === 'processing' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-flex' }}
            >
              <PhosphorIcon name="GearSix" size={18} />
            </motion.div>
          ) : (
            <PhosphorIcon name={config.icon} size={18} weight="bold" />
          )}
        </div>
        <div className="product-ai-state__content">
          <div className="product-ai-state__label">{config.label}</div>
          {state === 'failed' && onRetry && (
            <button type="button" onClick={onRetry} className="product-ai-state__retry">
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================
   TrustBadge — AI vs verified data indicator
   ============================================================ */

type TrustLevel = 'verified' | 'ai-generated' | 'hybrid';

interface TrustBadgeProps {
  level: TrustLevel;
  label?: string;
}

export const TrustBadge = ({ level, label }: TrustBadgeProps) => {
  const config: Record<TrustLevel, { text: string; bg: string; color: string; icon: PhosphorIconName }> = {
    verified: { text: label || 'Verified profile information', bg: 'var(--color-success-soft)', color: 'var(--color-success)', icon: 'Check' },
    'ai-generated': { text: label || 'AI-generated insight', bg: 'var(--color-primary-soft)', color: 'var(--color-primary)', icon: 'Sparkle' },
    hybrid: { text: label || 'AI-assisted insight', bg: '#fef3c7', color: '#d97706', icon: 'Sparkle' },
  };

  const { text, bg, color, icon } = config[level];

  return (
    <span className="product-ai-trust" style={{ background: bg, color }}>
      <span className="product-ai-trust__icon" aria-hidden="true"><PhosphorIcon name={icon} size={10} weight="bold" /></span>
      {text}
    </span>
  );
};

/* ============================================================
   ConversationBubble — chat message component
   ============================================================ */

interface ConversationBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: string[];
  isStreaming?: boolean;
}

export const ConversationBubble = ({ role, content, timestamp, sources, isStreaming }: ConversationBubbleProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`product-ai-chat product-ai-chat--${role}`}
    >
      <div className="product-ai-chat__bubble">
        {role === 'assistant' && <div className="product-ai-chat__avatar">AI</div>}
        <div className="product-ai-chat__content">
          <div className="product-ai-chat__message">
            {content}
            {isStreaming && <span className="product-ai-chat__cursor" aria-hidden="true" />}
          </div>
          {timestamp && <div className="product-ai-chat__time">{timestamp}</div>}
          {sources && sources.length > 0 && <RAGSources sources={sources} />}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================================================
   SuggestedPrompts — contextual prompt suggestions
   ============================================================ */

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export const SuggestedPrompts = ({ prompts, onSelect }: SuggestedPromptsProps) => {
  return (
    <div className="product-ai-prompts">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="product-ai-prompts__btn"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

/* ============================================================
   Styles
   ============================================================ */

export const ProductAIStyles = () => (
  <style>{`
    /* AIInsightPanel */
    .product-ai-panel {
      width: 100%;
      max-width: 480px;
    }
    .product-ai-panel__chrome {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .product-ai-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-muted);
    }
    .product-ai-panel__header-left {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .product-ai-panel__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      color: white;
      font-size: 9px;
      font-weight: 800;
    }
    .product-ai-panel__title {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .product-ai-panel__badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      background: var(--color-success-soft);
      color: var(--color-success);
    }
    .product-ai-panel__body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    /* MatchExplanation */
    .product-ai-match {
      width: 100%;
      max-width: 420px;
    }
    .product-ai-match__inner {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .product-ai-match__header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-5) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-muted);
    }
    .product-ai-match__score {
      font-size: var(--text-4xl);
      font-weight: 800;
      color: var(--color-text);
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .product-ai-match__label {
      font-size: var(--text-xs);
      font-weight: 700;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .product-ai-match__section {
      padding: var(--space-4);
    }
    .product-ai-match__section-title {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-2);
    }
    .product-ai-match__divider {
      height: 1px;
      background: var(--color-border);
      margin-bottom: var(--space-3);
    }
    .product-ai-match__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .product-ai-match__item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
    }
    .product-ai-match__item--matched { color: var(--color-success); }
    .product-ai-match__item--missing { color: var(--color-text-secondary); }
    .product-ai-match__item--recommendation {
      color: var(--color-primary);
      font-weight: 600;
    }
    .product-ai-match__explanation {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    /* RAGSources */
    .product-ai-rag {
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-2);
      margin-top: var(--space-2);
    }
    .product-ai-rag__trigger {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      background: none;
      border: none;
      color: var(--color-text-tertiary);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      padding: 0;
    }
    .product-ai-rag__list {
      list-style: none;
      padding: 0;
      margin: var(--space-2) 0 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    .product-ai-rag__item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 10px;
      color: var(--color-text-secondary);
      padding-left: var(--space-2);
    }

    /* AIStateIndicator */
    .product-ai-state {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
    }
    .product-ai-state--ready {
      border-color: var(--color-success);
      background: var(--color-success-soft);
    }
    .product-ai-state--failed {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .product-ai-state__inner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .product-ai-state__icon {
      font-size: 18px;
      line-height: 1;
    }
    .product-ai-state__content {
      flex: 1;
      min-width: 0;
    }
    .product-ai-state__label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
    }
    .product-ai-state__retry {
      margin-top: var(--space-2);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      background: var(--color-primary);
      color: white;
      border: none;
      font-size: var(--text-xs);
      font-weight: 600;
      cursor: pointer;
    }

    /* TrustBadge */
    .product-ai-trust {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 2px var(--space-2);
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .product-ai-trust__icon {
      font-size: 9px;
      font-weight: 800;
    }

    /* ConversationBubble */
    .product-ai-chat {
      display: flex;
      width: 100%;
    }
    .product-ai-chat--user {
      justify-content: flex-end;
    }
    .product-ai-chat--assistant {
      justify-content: flex-start;
    }
    .product-ai-chat__bubble {
      display: flex;
      gap: var(--space-3);
      max-width: 85%;
    }
    .product-ai-chat--user .product-ai-chat__bubble {
      flex-direction: row-reverse;
    }
    .product-ai-chat__avatar {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .product-ai-chat__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
    .product-ai-chat__message {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-xl);
      font-size: var(--text-sm);
      line-height: 1.5;
    }
    .product-ai-chat--user .product-ai-chat__message {
      background: var(--color-primary);
      color: var(--color-primary-text);
      border-bottom-right-radius: var(--radius-md);
    }
    .product-ai-chat--assistant .product-ai-chat__message {
      background: var(--color-surface-muted);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      border-bottom-left-radius: var(--radius-md);
    }
    .product-ai-chat__cursor {
      display: inline-block;
      width: 6px;
      height: 14px;
      background: var(--color-primary);
      margin-left: 2px;
      animation: product-ai-blink 1s step-end infinite;
    }
    @keyframes product-ai-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .product-ai-chat__time {
      font-size: 10px;
      color: var(--color-text-tertiary);
      padding: 0 var(--space-1);
    }

    /* SuggestedPrompts */
    .product-ai-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .product-ai-prompts__btn {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: var(--color-surface-muted);
      color: var(--color-text-secondary);
      font-size: var(--text-xs);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .product-ai-prompts__btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: var(--color-primary-soft);
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .product-ai-chat__cursor {
        animation: none;
      }
    }

    @media (max-width: 640px) {
      .product-ai-panel,
      .product-ai-match {
        max-width: 100%;
      }
      .product-ai-panel__chrome,
      .product-ai-match__inner {
        border-radius: var(--radius-lg);
      }
    }
  `}</style>
);
