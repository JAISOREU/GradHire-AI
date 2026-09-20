import type { NextFunction, Request, Response } from 'express';

/**
 * Origin verification for state-changing (non-GET) requests.
 *
 * Browsers always send an `Origin` header on cross-origin POST/PUT/PATCH/DELETE
 * (and usually a `Referer` for form submissions). Verifying it upstream of the
 * route handlers closes the cross-site POST vector for cookie-authenticated
 * endpoints that are otherwise exempt from CSRF double-submit checks (e.g.
 * `/api/v1/auth/refresh` in production, where the auth cookies are
 * `SameSite=None`).
 */

export function parseOriginOf(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Returns `true` when a state-changing request may proceed.
 *
 * - No `Origin` and no `Referer` -> no browser context (native client,
 *   server-to-server, curl) -> allow.
 * - `Origin` or `Referer` present -> its parsed origin must be in the allowlist.
 * - Malformed/un-parseable source -> block (fail closed).
 */
export function isAllowedCrossOriginRequest(
  origin: string | undefined,
  referer: string | undefined,
  allowedOrigins: string[],
): boolean {
  const source = origin ?? referer;
  if (!source) {
    return true;
  }
  const sourceOrigin = parseOriginOf(source);
  if (!sourceOrigin) {
    return false;
  }
  return allowedOrigins.includes(sourceOrigin);
}

export function createOriginCheckMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const origin = req.headers.origin as string | undefined;
    const referer = req.headers.referer as string | undefined;

    if (isAllowedCrossOriginRequest(origin, referer, allowedOrigins)) {
      return next();
    }

    console.warn(`[ORIGIN-CHECK] Blocked ${req.method} ${req.path} from origin=${origin ?? 'n/a'} referer=${referer ?? 'n/a'}`);
    return res.status(403).json({ message: 'Request origin not allowed' });
  };
}