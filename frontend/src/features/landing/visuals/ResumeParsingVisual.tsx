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

export const ResumeParsingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--resume ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="scan-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="resume-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="resume-document">
          <rect x="60" y="40" width="140" height="180" rx="10" fill="url(#resume-gradient)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <rect x="80" y="70" width="100" height="8" rx="4" fill="var(--color-border)" />
          <rect x="80" y="95" width="80" height="8" rx="4" fill="var(--color-border)" />
          <rect x="80" y="120" width="100" height="8" rx="4" fill="var(--color-primary-soft)" />
          <rect x="80" y="145" width="70" height="8" rx="4" fill="var(--color-border)" />
          <rect x="80" y="170" width="90" height="8" rx="4" fill="var(--color-border)" />
          <rect x="80" y="195" width="60" height="8" rx="4" fill="var(--color-border)" />
        </g>

        <g className="resume-scan">
          <rect x="60" y="40" width="140" height="180" rx="10" fill="url(#scan-gradient)" />
        </g>

        <g className="resume-profile">
          <rect x="240" y="40" width="120" height="180" rx="10" fill="url(#resume-gradient)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="256" y="65" width="88" height="6" rx="3" fill="var(--color-primary)" />
          <rect x="256" y="82" width="60" height="6" rx="3" fill="var(--color-border)" />
          <rect x="256" y="105" width="80" height="6" rx="3" fill="var(--color-border)" />
          <rect x="256" y="130" width="70" height="6" rx="3" fill="var(--color-border)" />
          <rect x="256" y="155" width="50" height="6" rx="3" fill="var(--color-success)" />
          <rect x="256" y="180" width="90" height="6" rx="3" fill="var(--color-border)" />
        </g>

        <g className="resume-arrow">
          <path d="M 200 130 L 240 130" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="240,130 234,126 234,134" fill="var(--color-primary)" />
        </g>
      </svg>

      <style>{`
        .feature-visual--resume .resume-document { opacity: 0; transform: translateX(-10px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .feature-visual--resume .resume-scan { opacity: 0; transition: opacity 0.6s ease; }
        .feature-visual--resume .resume-profile { opacity: 0; transform: translateX(10px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .feature-visual--resume .resume-arrow { opacity: 0; transition: opacity 0.6s ease; }

        .feature-visual--resume.is-animated .resume-document { opacity: 1; transform: translateX(0); transition-delay: 0.1s; }
        .feature-visual--resume.is-animated .resume-scan { opacity: 1; transition-delay: 0.4s; }
        .feature-visual--resume.is-animated .resume-arrow { opacity: 1; transition-delay: 0.7s; }
        .feature-visual--resume.is-animated .resume-profile { opacity: 1; transform: translateX(0); transition-delay: 0.9s; }
      `}</style>
    </div>
  );
};
