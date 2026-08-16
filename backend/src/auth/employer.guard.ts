import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class EmployerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: { role: string } }>();
    const user = request.user;
    if (!user || user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Employer access required');
    }
    return true;
  }
}
