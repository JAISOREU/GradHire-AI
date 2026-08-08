import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingMiddleware } from './common/logging.middleware';
import { auditLoggingMiddleware } from './audit/audit.middleware';
import { PrismaService } from './prisma.service';
import helmet from 'helmet';

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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);

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

  app.use(new LoggingMiddleware().use.bind(new LoggingMiddleware()));
  app.use(auditLoggingMiddleware(prisma));

  app.enableCors({ origin: parseCorsOrigins(), credentials: true });
  app.setGlobalPrefix('api/v1');

  const server = app.listen(3000);

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
