import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { logger } from './logger';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const start = Date.now();
    const { method, url, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const contentLength = res.getHeader('content-length');
      const log: Record<string, unknown> = {
        correlationId,
        method,
        url,
        status,
        duration,
        ip,
      };
      if (contentLength) log.contentLength = contentLength;

      if (status >= 500) {
        logger.error(log);
      } else if (status >= 400) {
        logger.warn(log);
      } else {
        logger.info(log);
      }
    });

    next();
  }
}
