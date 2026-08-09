import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../prisma.service';
import { normalizePagination, PaginatedResponse, applyPagination } from '../common/pagination';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const [users, employers, students, jobs, applications, notifications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'EMPLOYER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.application.count(),
      this.prisma.notification.count({ where: { read: false } }),
    ]);

    return {
      users,
      employers,
      students,
      activeJobs: jobs,
      applicationsToday: applications,
      notificationsUnread: notifications,
    };
  }

  @Get('users')
  async users(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<{ id: string; email: string; role: string; createdAt: Date }>> {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' } as any,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return applyPagination(users, total, page, limit);
  }

  @Get('jobs')
  async jobs(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        include: { employer: { select: { email: true } } },
        orderBy: { createdAt: 'desc' } as any,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count(),
    ]);
    return applyPagination(jobs, total, page, limit);
  }

  @Get('applications')
  async applications(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        include: {
          student: { select: { email: true } },
          job: { select: { title: true, company: true } },
        },
        orderBy: { createdAt: 'desc' } as any,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count(),
    ]);
    return applyPagination(applications, total, page, limit);
  }

  @Get('companies')
  async companies(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<{ id: string; name: string; industry: string | null; location: string | null; description: string | null; logo: string | null }>> {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count(),
    ]);
    return applyPagination(companies, total, page, limit);
  }

  @Get('audit-logs')
  async auditLogs() {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Get('notifications')
  async notifications() {
    return this.prisma.notification.findMany({
      include: { recipient: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Get('settings')
  async settings() {
    return {
      platformName: 'Gradture AI',
      maintenanceMode: false,
      registrationOpen: true,
    };
  }
}
