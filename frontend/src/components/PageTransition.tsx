import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type PageTransitionProps = {
  children: ReactNode;
  transitionKey?: string;
};

export const PageTransition = ({ children, transitionKey }: PageTransitionProps) => {
  const location = useLocation();
  const [status, setStatus] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    setStatus('enter');
    const raf = requestAnimationFrame(() => {
      setStatus('active');
    });
    return () => cancelAnimationFrame(raf);
  }, [transitionKey]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

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
