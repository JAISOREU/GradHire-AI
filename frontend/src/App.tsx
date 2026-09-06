import { useEffect, useRef } from 'react';
import { AppRoutes } from './routing/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './core/theme/ThemeContext';

const App = () => {
  const rafRef = useRef<number>(0);
  const lastTarget = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const target = event.target as HTMLElement;
        if (target === lastTarget.current) return;
        lastTarget.current = target;

        const card = target.closest<HTMLElement>('.card, .list-item, .kpi-card, .status-card, .stat-card');
        if (card) {
          const rect = card.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', `${x}%`);
          card.style.setProperty('--mouse-y', `${y}%`);
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
