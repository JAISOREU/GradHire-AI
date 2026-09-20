import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

const PRISMA_ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
  P2002: { statusCode: HttpStatus.CONFLICT, message: 'A record with this value already exists' },
  P2025: { statusCode: HttpStatus.NOT_FOUND, message: 'Resource not found' },
  P2003: { statusCode: HttpStatus.BAD_REQUEST, message: 'Related record does not exist' },
  P2014: { statusCode: HttpStatus.BAD_REQUEST, message: 'The required relation was violated' },
};

function isPrismaError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string;
      let errors: Record<string, string[]> | undefined;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (Array.isArray(exceptionResponse)) {
        message = 'Validation failed';
        errors = { messages: exceptionResponse };
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, unknown>;
        message = typeof body.message === 'string' ? body.message : 'Error';
        errors = body.errors as Record<string, string[]> | undefined;
      } else {
        message = 'Error';
      }

      this.logger.warn({
        message: exception.message,
        statusCode: status,
        path: request.url,
        method: request.method,
      });

      response.status(status).json({
        statusCode: status,
        message,
        ...(errors && { errors }),
        ...(isDevelopment && { stack: (exception as Error).stack }),
      });
      return;
    }

    const error = exception as Error;

    if (isPrismaError(exception)) {
      const mapping = PRISMA_ERROR_MAP[exception.code];
      if (mapping) {
        this.logger.warn({
          message: exception.message,
          statusCode: mapping.statusCode,
          code: exception.code,
          path: request.url,
          method: request.method,
        });
        response.status(mapping.statusCode).json({
          statusCode: mapping.statusCode,
          message: mapping.message,
        });
        return;
      }
    }

    Sentry.captureException(error);
    this.logger.error({
      message: error.message,
      stack: error.stack,
      path: request.url,
      method: request.method,
    });

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack }),
    });
  }
}
