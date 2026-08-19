import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; cookies?: Record<string, string>; user?: unknown }>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const authHeader = request.headers['authorization'];
    let token: string | undefined;
    
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        token = parts[1];
      }
    }
    
    if (!token && request.cookies?.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      this.logger.warn(`AuthGuard: no token found. cookies=${Object.keys(request.cookies || {}).join(',') || 'none'}`);
      try {
        this.auth.clearSessionCookie(response);
      } catch {
        // ignore cookie clearing errors
      }
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const user = await this.auth.validateToken(token);
      request.user = user;
      return true;
    } catch (err) {
      try {
        this.auth.clearSessionCookie(response);
      } catch {
        // ignore cookie clearing errors
      }
      this.logger.warn(`AuthGuard: token validation failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
}
