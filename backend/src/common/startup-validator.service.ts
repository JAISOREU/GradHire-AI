import { Injectable, Logger } from '@nestjs/common';

export interface StartupCheck {
  name: string;
  required: boolean;
  ok: boolean;
  message?: string;
}

@Injectable()
export class StartupValidator {
  private readonly logger = new Logger(StartupValidator.name);

  validate(): StartupCheck[] {
    const checks: StartupCheck[] = [];

    checks.push(this.checkEnv('DATABASE_URL', true));
    checks.push(this.checkEnv('JWT_SECRET', true));
    checks.push(this.checkEnv('CORS_ORIGIN', true));
    checks.push(this.checkEnv('FRONTEND_URL', false, 'Email links may be incorrect'));

    const storageProvider = process.env.STORAGE_PROVIDER ?? 'local';
    if (storageProvider === 'r2') {
      checks.push(this.checkEnv('R2_ACCOUNT_ID', true));
      checks.push(this.checkEnv('R2_ACCESS_KEY', true));
      checks.push(this.checkEnv('R2_SECRET_KEY', true));
    } else if (storageProvider === 's3') {
      checks.push(this.checkEnv('S3_ACCESS_KEY', true));
      checks.push(this.checkEnv('S3_SECRET_KEY', true));
    }

    const failed = checks.filter((c) => !c.ok);
    if (failed.length > 0) {
      this.logger.warn('Startup validation failed:', failed.map((c) => `[${c.name}] ${c.message}`));
    } else {
      this.logger.log('Startup validation passed');
    }

    return checks;
  }

  private checkEnv(name: string, required: boolean, message?: string): StartupCheck {
    const value = process.env[name];
    const ok = Boolean(value) && typeof value === 'string' && !value.includes('your-') && !value.includes('change-me');
    return {
      name,
      required,
      ok,
      message: ok ? undefined : message ?? `${name} is missing or uses a placeholder value`,
    };
  }
}
