import { AppRoutes } from './routing/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SocketProvider } from './core/websocket/SocketContext';

const App = () => (
  <ErrorBoundary>
    <SocketProvider>
      <AppRoutes />
    </SocketProvider>
  </ErrorBoundary>
);

export default App;
