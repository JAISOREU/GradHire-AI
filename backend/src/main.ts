import './instrument';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './common/logging.middleware';
import { auditLoggingMiddleware } from './audit/audit.middleware';
import { PrismaService } from './prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { StartupValidator } from './common/startup-validator.service';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

dotenv.config();

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CORS_ORIGIN environment variable is required in production');
    }
    return ['http://localhost:5173', 'http://localhost:3000'];
  }
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function createCorsOriginChecker(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, false);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  };
}

let currentCsrfToken: string | null = null;
let csrfTokenExpiresAt = 0;

function getOrCreateCsrfToken(): string {
  if (!currentCsrfToken || Date.now() > csrfTokenExpiresAt) {
    currentCsrfToken = require('crypto').randomBytes(32).toString('hex');
    csrfTokenExpiresAt = Date.now() + 60 * 60 * 1000;
  }
  return currentCsrfToken as string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);

  const validator = app.get(StartupValidator);
  const startupChecks = validator.validate();
  const failedRequired = startupChecks.filter((c) => !c.ok && c.required);
  if (failedRequired.length > 0) {
    console.error('[STARTUP] Failed required checks:', failedRequired.map((c) => c.name));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  const corsOrigins = parseCorsOrigins();
  console.log(`[CORS] Allowed origins: ${corsOrigins.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`[CORS] If you see CORS errors in production, ensure CORS_ORIGIN includes your frontend domain (e.g., https://grad-hire-ai.vercel.app)`);
  }

  app.enableCors({
    origin: createCorsOriginChecker(corsOrigins),
    credentials: true,
    exposedHeaders: ['X-CSRF-TOKEN'],
  });

  app.use(cookieParser());
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));
  app.use(auditLoggingMiddleware(prisma));

  app.use((req: Request, res: Response, next: Function) => {
    const token = getOrCreateCsrfToken();
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'none',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });
    res.set('X-CSRF-TOKEN', token);
    (req as any).csrfToken = token;
    next();
  });

  app.use((req: Request, res: Response, next: Function) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password', '/api/v1/auth/verify-email', '/api/v1/auth/logout', '/api/v1/auth/send-verification'];
    if (publicPaths.includes(req.path)) {
      return next();
    }

    const csrfCookie = (req as any).cookies?.['XSRF-TOKEN'];
    const csrfHeader = (req.headers as any)['x-xsrf-token'] || (req.headers as any)['x-csrf-token'];
    const serverToken = (req as any).csrfToken;

    const isValid =
      (csrfCookie && csrfHeader && csrfCookie === csrfHeader) ||
      (csrfHeader && serverToken && csrfHeader === serverToken);

    if (!isValid) {
      console.warn(`[CSRF] Blocked ${req.method} ${req.path}`, {
        hasCookie: !!csrfCookie,
        hasHeader: !!csrfHeader,
        cookieLength: csrfCookie?.length,
        headerLength: csrfHeader?.length,
        allCookies: Object.keys(req.cookies || {}).join(','),
      });
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next();
  });

  const connectSrc = ["'self'", "ws:", "wss:", ...corsOrigins];

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: connectSrc,
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = parseInt(process.env.PORT || '3000', 10);

  const server = app.listen(port);

  return server;
}

async function main() {
  const server = await bootstrap();

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
