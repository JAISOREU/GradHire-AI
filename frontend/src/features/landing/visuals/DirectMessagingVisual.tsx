import { useInView } from '../../../core/hooks/useInView';

export const DirectMessagingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--messaging ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chat-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="msg-candidate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
        </defs>

        <g className="chat-window">
          <rect x="50" y="30" width="320" height="220" rx="14" fill="url(#chat-bg)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="50" y="30" width="320" height="40" rx="14" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="50" y="56" width="320" height="14" fill="var(--color-surface-muted, #fefcf8)" stroke="none" />
          <text x="210" y="58" textAnchor="middle" fill="var(--color-text, #1a1814)" fontSize="12" fontWeight="700">Hiring Team</text>
          <circle cx="300" cy="50" r="5" fill="var(--color-success, #059669)" />
          <text x="308" y="54" textAnchor="start" fill="var(--color-success, #059669)" fontSize="9" fontWeight="700">Online</text>
        </g>

        <g className="msg-candidate">
          <rect x="80" y="86" width="210" height="40" rx="10" fill="url(#msg-candidate)" />
          <text x="280" y="110" textAnchor="end" fill="var(--color-primary-text, #ffffff)" fontSize="10" fontWeight="600">Interested in this role.</text>
        </g>

        <g className="msg-typing">
          <circle cx="310" cy="144" r="3" fill="var(--color-text-muted, #8c8680)" opacity="0.6" />
          <circle cx="320" cy="144" r="3" fill="var(--color-text-muted, #8c8680)" opacity="0.6" />
          <circle cx="330" cy="144" r="3" fill="var(--color-text-muted, #8c8680)" opacity="0.6" />
        </g>

        <g className="msg-employer">
          <rect x="60" y="170" width="240" height="40" rx="10" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="80" y="194" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="500">Thanks! We'd like to continue.</text>
        </g>

        <g className="msg-status">
          <rect x="70" y="222" width="140" height="12" rx="6" fill="var(--color-success-soft, #ecfdf5)" />
          <text x="140" y="232" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="9" fontWeight="700">Conversation continued</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--messaging .chat-window,
        .feature-visual--messaging .msg-candidate,
        .feature-visual--messaging .msg-typing,
        .feature-visual--messaging .msg-employer,
        .feature-visual--messaging .msg-status {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--messaging.is-animated .chat-window { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--messaging.is-animated .msg-candidate { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .feature-visual--messaging.is-animated .msg-typing { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .feature-visual--messaging.is-animated .msg-employer { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
        .feature-visual--messaging.is-animated .msg-status { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--messaging * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

