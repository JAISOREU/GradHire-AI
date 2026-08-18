import { useEffect, useRef, useState } from 'react';

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.2, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

export const DirectMessagingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--messaging ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chat-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="msg-candidate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="chat-window">
          <rect x="40" y="30" width="320" height="220" rx="14" fill="url(#chat-bg)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="30" width="320" height="40" rx="14" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="56" width="320" height="14" fill="var(--color-surface-muted)" stroke="none" />
          <text x="60" y="58" textAnchor="start" fill="var(--color-text)" fontSize="12" fontWeight="700">Hiring Team</text>
          <circle cx="340" cy="50" r="5" fill="var(--color-success)" />
          <text x="352" y="54" textAnchor="start" fill="var(--color-success)" fontSize="9" fontWeight="700">Online</text>
        </g>

        <g className="msg-candidate">
          <rect x="200" y="86" width="140" height="40" rx="10" fill="url(#msg-candidate)" />
          <text x="328" y="110" textAnchor="end" fill="var(--color-primary-text)" fontSize="10" fontWeight="600">Hi, I'm interested in this role.</text>
        </g>

        <g className="msg-typing">
          <circle cx="330" cy="144" r="3" fill="var(--color-text-muted)" opacity="0.6" />
          <circle cx="340" cy="144" r="3" fill="var(--color-text-muted)" opacity="0.6" />
          <circle cx="350" cy="144" r="3" fill="var(--color-text-muted)" opacity="0.6" />
        </g>

        <g className="msg-employer">
          <rect x="60" y="170" width="160" height="40" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="72" y="194" textAnchor="start" fill="var(--color-text-secondary)" fontSize="10" fontWeight="500">Thanks! We'd like to continue.</text>
        </g>

        <g className="msg-status">
          <rect x="60" y="222" width="140" height="12" rx="6" fill="var(--color-success-soft)" />
          <text x="130" y="232" textAnchor="middle" fill="var(--color-success)" fontSize="9" fontWeight="700">Conversation continued</text>
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
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--messaging.is-animated .chat-window { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--messaging.is-animated .msg-candidate { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .feature-visual--messaging.is-animated .msg-typing { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .feature-visual--messaging.is-animated .msg-employer { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
        .feature-visual--messaging.is-animated .msg-status { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
      `}</style>
    </div>
  );
};
