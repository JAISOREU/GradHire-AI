import { AppRoutes } from './routing/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApiStatusPill } from './components/ApiStatusPill';
import { ThemeProvider } from './core/theme/ThemeContext';

const App = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
    <ApiStatusPill />
  </ThemeProvider>
);

export default App;