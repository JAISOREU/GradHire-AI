import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class StudentGuard implements CanActivate {
  private readonly logger = new Logger(StudentGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { role: string; id?: string }; url?: string }>();
    const user = request.user;
    if (!user || user.role !== 'STUDENT') {
      this.logger.warn(`StudentGuard blocked access: user=${user ? JSON.stringify(user) : 'null'}, path=${request.url}`);
      throw new ForbiddenException('Student access required');
    }
    return true;
  }
}
