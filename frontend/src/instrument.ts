import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;
const isProd = import.meta.env.MODE === 'production';

// Only initialize Sentry when a DSN is configured.
// In development without a DSN, skip initialization entirely —
// this avoids pulling the full SDK into the bundle.
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,

    dataCollection: {
      userInfo: false,
      httpBodies: [],
    },

    integrations: [
      Sentry.browserTracingIntegration(),
      // Only enable Session Replay in production to avoid the ~130 KB bundle cost in dev
      ...(isProd
        ? [
               Sentry.replayIntegration({
               maskAllText: true,
               blockAllMedia: true,
             }),
          ]
        : []),
    ],

    tracesSampleRate: isProd ? 1.0 : 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/gradture\.ai\/api/],

    // Replay sampling is only relevant when the integration is active
    ...(isProd
      ? {
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        }
      : {}),

    enableLogs: false,
  });
}

