import * as dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'production',
  release: process.env.SENTRY_RELEASE,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },

  tracesSampleRate: 0.1,

  enableLogs: true,

  integrations: [
    Sentry.prismaIntegration(),
    Sentry.redisIntegration(),
  ],
});
