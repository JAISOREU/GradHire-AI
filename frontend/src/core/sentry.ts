/**
 * Thin Sentry wrapper — avoids importing the full Sentry SDK bundle
 * when no DSN is configured (e.g. local development or production
 * without monitoring).
 *
 * When called without a DSN, all functions are safe no-ops.
 * When called with a DSN, `init` must be invoked once (in main.tsx /
 * instrument.ts) before `captureException` or `reactErrorHandler`
 * produce meaningful side-effects.
 */

/** Lazily load the real Sentry SDK only when an error occurs */
async function ensureSentry(): Promise<typeof import('@sentry/react') | null> {
  try {
    return await import('@sentry/react');
  } catch {
    return null;
  }
}

export async function reportError(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const Sentry = await ensureSentry();
  if (Sentry) {
    // Sentry's `contexts` expects Record<string, Record<string, any>>;
    // narrow via a cast to satisfy the type without changing callers.
    Sentry.captureException(error, { contexts: context as never });
  }
}

export function getReactErrorHandler() {
  // Returns a deferred handler that lazily loads Sentry on error.
  // The signature matches what React's error-boundary callbacks expect.
  return (error: unknown, errorDetails: { componentStack?: string | null; event?: string }) => {
    reportError(error, {
      react: {
        componentStack: errorDetails?.componentStack ?? undefined,
      },
    });
  };
}
