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
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <rect x="40" y="30" width="320" height="200" rx="14" fill="url(#chat-bg)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="30" width="320" height="36" rx="14" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="54" width="320" height="12" fill="var(--color-surface-muted)" stroke="none" />
          <text x="60" y="54" textAnchor="start" fill="var(--color-text)" fontSize="11" fontWeight="700">Hiring Team</text>
          <circle cx="320" cy="46" r="4" fill="var(--color-success)" />
          <text x="330" y="50" textAnchor="start" fill="var(--color-success)" fontSize="8" fontWeight="600">Online</text>
        </g>

        <g className="msg-candidate">
          <rect x="200" y="80" width="140" height="36" rx="10" fill="url(#msg-candidate)" />
          <text x="328" y="103" textAnchor="end" fill="#fff" fontSize="9" fontWeight="600">Hi, I'm interested in this role.</text>
        </g>

        <g className="msg-typing">
          <circle cx="330" cy="136" r="3" fill="var(--color-text-muted)" opacity="0.6" />
          <circle cx="340" cy="136" r="3" fill="var(--color-text-muted)" opacity="0.6" />
          <circle cx="350" cy="136" r="3" fill="var(--color-text-muted)" opacity="0.6" />
        </g>

        <g className="msg-employer">
          <rect x="60" y="160" width="160" height="36" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="72" y="183" textAnchor="start" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Thanks! We'd like to continue.</text>
        </g>

        <g className="msg-status">
          <rect x="60" y="210" width="120" height="10" rx="5" fill="var(--color-success-soft)" />
          <text x="120" y="219" textAnchor="middle" fill="var(--color-success)" fontSize="8" fontWeight="700">Conversation continued ✓</text>
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
