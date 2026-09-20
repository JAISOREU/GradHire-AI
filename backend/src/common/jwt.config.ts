import type { JwtSignOptions } from '@nestjs/jwt';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return 'gradture-dev-secret-change-me';
  }
  if (process.env.NODE_ENV === 'production' && secret === 'gradture-dev-secret-change-me') {
    throw new Error('JWT_SECRET must be changed in production');
  }
  return secret;
})();

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as JwtSignOptions['expiresIn'];

export { JWT_SECRET, JWT_EXPIRES_IN };