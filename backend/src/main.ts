import './instrument';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './common/logging.middleware';
import { auditLoggingMiddleware } from './audit/audit.middleware';
import { PrismaService } from './prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
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
  const origins = raw.split(',').map((origin) => origin.trim()).filter(Boolean);
  return origins;
}

function getCookieOptions(): Record<string, unknown> {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000,
    path: '/',
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);

  const corsOrigins = parseCorsOrigins();
  console.log(`[CORS] Allowed origins: ${corsOrigins.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`[CORS] If you see CORS errors in production, ensure CORS_ORIGIN includes your frontend domain (e.g., https://grad-hire-ai.vercel.app)`);
  }

  app.use(cookieParser());
  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));
  app.use(auditLoggingMiddleware(prisma));

  app.use((req: Request, res: Response, next: Function) => {
    const csrfToken = (req as any).cookies?.['XSRF-TOKEN'] || require('crypto').randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    (req as any).csrfToken = csrfToken;
    next();
  });

  app.use((req: Request, res: Response, next: Function) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const publicPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh', '/api/v1/auth/forgot-password', '/api/v1/auth/reset-password', '/api/v1/auth/verify-email'];
    if (publicPaths.includes(req.path)) {
      return next();
    }

    const csrfCookie = (req as any).cookies?.['XSRF-TOKEN'];
    const csrfHeader = (req.headers as any)['x-xsrf-token'] || (req.headers as any)['x-csrf-token'];
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
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

  app.enableCors({ origin: parseCorsOrigins(), credentials: true });
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