import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class StudentGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { role: string } }>();
    const user = request.user;
    if (!user || user.role !== 'STUDENT') {
      throw new ForbiddenException('Student access required');
    }
    return true;
  }
}
