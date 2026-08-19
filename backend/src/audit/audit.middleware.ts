import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma.service';

export function auditLoggingMiddleware(prisma: PrismaService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { id?: string; email?: string } }).user;
    const start = Date.now();

    res.on('finish', async () => {
      if (!user?.id) {
        return;
      }

      const url = req.originalUrl || req.url;
      const metadata: Record<string, unknown> = {
        method: req.method,
        path: url,
        status: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const action = `${req.method} ${url}`;
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action,
            metadata: metadata as any,
          },
        });
      } catch {
        // Do not block responses on audit failures.
      }
    });

    next();
  };
}
