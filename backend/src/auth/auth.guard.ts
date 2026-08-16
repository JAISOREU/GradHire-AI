import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; cookies?: Record<string, string>; user?: unknown }>();
    
    let token = request.headers['authorization']?.toString().split(' ')[1];
    
    if (!token && request.cookies?.access_token) {
      token = request.cookies.access_token;
    }

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const user = await this.auth.validateToken(token);
    request.user = user;
    return true;
  }
}
