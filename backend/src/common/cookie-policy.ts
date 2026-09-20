export interface CookiePolicy {
  sameSite: 'lax' | 'none';
  secure: boolean;
}

export interface CookiePolicyInput {
  isProduction: boolean;
  /** Host (without port) that serves the API, e.g. `localhost`. */
  serverHost?: string;
  /** Allowed browser origins from CORS_ORIGIN, e.g. `http://localhost:5173`. */
  corsOrigins?: string[];
}

function hostOf(origin: string): string {
  try {
    return new URL(origin).hostname;
  } catch {
    return '';
  }
}

const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

/** Parse the CORS_ORIGIN env var the same way main.ts does. */
export function corsOriginsFromEnv(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return process.env.NODE_ENV === 'production' ? [] : [...DEFAULT_DEV_ORIGINS];
  }
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

/** Env-driven policy used by auth.service and main.ts. */
export function cookiePolicyFromEnv(): CookiePolicy {
  return resolveCookiePolicy({
    isProduction: process.env.NODE_ENV === 'production',
    serverHost: process.env.COOKIE_SERVER_HOST ?? 'localhost',
    corsOrigins: corsOriginsFromEnv(),
  });
}

/**
 * Decide the SameSite/Secure policy for session cookies.
 *
 * Browsers attach cookies to cross-site XHR/fetch only when SameSite=None
 * (with Secure). Two origins are "same site" only when they share a registrable
 * domain AND are NOT both special-case hosts: modern browsers treat
 * `http://localhost:3000` API and `http://127.0.0.1:5173` frontend as
 * *different sites*, so a Lax cookie set by the API is simply not sent on those
 * requests (all auth endpoints 401 until a refresh/navigation).
 *
 * Rule:
 *  - production: always None + Secure (cross-origin is guaranteed).
 *  - dev: Lax when every allowed origin is same-site as the API; None + Secure
 *    as soon as any allowed origin is cross-site (e.g. 127.0.0.1 vs localhost).
 */
export function resolveCookiePolicy(input: CookiePolicyInput): CookiePolicy {
  if (input.isProduction) {
    return { sameSite: 'none', secure: true };
  }

  const origins = input.corsOrigins ?? [];
  if (origins.length === 0) {
    return { sameSite: 'lax', secure: false };
  }

  const serverHost = input.serverHost ? input.serverHost.toLowerCase() : 'localhost';

  // The API's own origin is harmless — exclude it from the cross-site check.
  const browserOrigins = origins.filter((origin) => hostOf(origin) !== serverHost);

  // After excluding the API's own origin, any remaining browser origin that is
  // not the server host is cross-site by construction (localhost vs 127.0.0.1,
  // or any LAN/WAN origin) → must use None + Secure.
  return browserOrigins.length === 0 ? { sameSite: 'lax', secure: false } : { sameSite: 'none', secure: true };
}