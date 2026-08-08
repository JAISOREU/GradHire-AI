import { useState, useEffect, type ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  transitionKey?: string;
};

export const PageTransition = ({ children, transitionKey }: PageTransitionProps) => {
  const [status, setStatus] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    setStatus('enter');
    const raf = requestAnimationFrame(() => {
      setStatus('active');
    });
    return () => cancelAnimationFrame(raf);
  }, [transitionKey]);

  return (
    <div
      className={
        status === 'enter'
          ? 'page-enter'
          : status === 'active'
            ? 'page-enter-active'
            : 'page-exit-active'
      }
    >
      {children}
    </div>
  );
};
