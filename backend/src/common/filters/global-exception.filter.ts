import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

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
