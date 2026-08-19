import { Controller, Get, Patch, Delete, Param, Query, Req, UseGuards, Body, Post } from '@nestjs/common';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AuthUser } from '../auth/auth.service';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';
import { normalizePagination, PaginatedResponse, applyPagination } from '../common/pagination';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'backend', 'data', 'platform-settings.json');

function readSettingsFile(): Record<string, string> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {
    // ignore
  }
  return {};
}

function writeSettingsFile(data: Record<string, string>) {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

const DEFAULT_SETTINGS: Record<string, string> = {
  platformName: 'Gradture AI',
  maintenanceMode: 'false',
  registrationOpen: 'true',
};

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('dashboard')
  async dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [users, employers, students, jobs, applications, notifications] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'EMPLOYER' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.application.count({ where: { createdAt: { gte: today } } }),
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

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data: Record<string, unknown> = {};
    if (typeof payload.role === 'string') data.role = payload.role;
    return this.prisma.user.update({ where: { id }, data });
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    if (req.user.id === id) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
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

  @Patch('jobs/:id')
  async updateJob(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const data: Record<string, unknown> = {};
    if (typeof payload.status === 'string') data.status = payload.status;
    return this.prisma.job.update({ where: { id }, data });
  }

  @Delete('jobs/:id')
  async deleteJob(@Param('id') id: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    await this.prisma.job.delete({ where: { id } });
    return { deleted: true };
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

  @Patch('applications/:id')
  async updateApplication(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    const data: Record<string, unknown> = {};
    if (typeof payload.status === 'string') data.status = payload.status;
    return this.prisma.application.update({ where: { id }, data });
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

  @Patch('companies/:id')
  async updateCompany(@Param('id') id: string, @Body() payload: Record<string, unknown>) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const data: Record<string, unknown> = {};
    if (typeof payload.verified === 'boolean') data.verified = payload.verified;
    return this.prisma.company.update({ where: { id }, data });
  }

  @Get('audit-logs')
  async auditLogs(@Query() query?: Record<string, unknown>) {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return applyPagination(logs, total, page, limit);
  }

  @Get('notifications')
  async notifications(@Query() query?: Record<string, unknown>) {
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        include: { recipient: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count(),
    ]);
    return applyPagination(notifications, total, page, limit);
  }

  @Get('settings')
  async settings() {
    const data = { ...DEFAULT_SETTINGS, ...readSettingsFile() };
    return {
      platformName: data.platformName ?? 'Gradture AI',
      maintenanceMode: data.maintenanceMode === 'true',
      registrationOpen: data.registrationOpen !== 'false',
    };
  }

  @Patch('settings')
  async updateSettings(@Body() payload: Record<string, unknown>) {
    const current = readSettingsFile();
    if (typeof payload.platformName === 'string') current.platformName = payload.platformName;
    if (typeof payload.maintenanceMode === 'boolean') current.maintenanceMode = String(payload.maintenanceMode);
    if (typeof payload.registrationOpen === 'boolean') current.registrationOpen = String(payload.registrationOpen);
    writeSettingsFile(current);
    return this.settings();
  }

  @Get('profile')
  async profile(@Req() req: Request & { user: AuthUser }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw new NotFoundException('Admin not found');
    }
    return user;
  }

  @Post('users')
  async createUser(@Body() payload: Record<string, unknown>) {
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const password = typeof payload.password === 'string' ? payload.password : '';
    const role = typeof payload.role === 'string' ? payload.role : 'STUDENT';
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, role: role as Role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return user;
  }

  @Get('job-source-runs')
  async jobSourceRuns(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<Record<string, unknown>>> {
    const sourceId = typeof query?.sourceId === 'string' ? query.sourceId : undefined;
    const status = typeof query?.status === 'string' ? query.status : undefined;
    const { page = 1, limit = 20 } = query ? normalizePagination(query) : { page: 1, limit: 20 };
    const where: Record<string, unknown> = {};
    if (sourceId) where.sourceId = sourceId;
    if (status) where.status = status;
    const [runs, total] = await Promise.all([
      this.prisma.jobSourceRun.findMany({
        where,
        include: { source: { select: { id: true, name: true, company: true } } },
        orderBy: { createdAt: 'desc' } as any,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.jobSourceRun.count({ where }),
    ]);
    return applyPagination(runs, total, page, limit);
  }
}
