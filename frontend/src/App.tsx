import { useEffect } from 'react';
import { AppRoutes } from './routing/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SocketProvider } from './core/websocket/SocketContext';
import { ThemeProvider } from './core/theme/ThemeContext';

const App = () => {
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const card = target.closest<HTMLElement>('.card, .list-item, .kpi-card, .status-card, .stat-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
