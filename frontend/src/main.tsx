import './instrument';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { ToastProvider } from './core/toast/ToastContext';
import { getReactErrorHandler } from './core/sentry';
import { probeApiStatus } from './core/api/client';
import App from './App';
import './styles.css';
import { HelmetProvider } from 'react-helmet-async';

// Backend reachability probe: deduped, so the "server unreachable" state is
// detected once on boot and backgrounded calls fail fast without log spam.
void probeApiStatus().catch(() => {});

ReactDOM.createRoot(document.getElementById('root')!, {
  onUncaughtError: getReactErrorHandler(),
  onCaughtError: getReactErrorHandler(),
  onRecoverableError: getReactErrorHandler(),
}).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);
