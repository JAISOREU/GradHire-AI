import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';

@Injectable()
export class EmployerService {
  private readonly logger = new Logger(EmployerService.name);

  constructor(private readonly prisma: PrismaService) {}

  private requireEmployer(user: AuthUser): void {
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('This action requires the EMPLOYER role');
    }
  }

  async createJob(
    user: AuthUser,
    body: { title: string; company: string; location: string; type?: string; description?: string; salaryMin?: number; salaryMax?: number },
  ) {
    this.requireEmployer(user);

    if (!body.title || !body.company || !body.location) {
      throw new BadRequestException('title, company, and location are required');
    }

    const jobType = body.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'HIRING';

    return this.prisma.job.create({
      data: {
        employerId: user.id,
        title: body.title,
        company: body.company,
        location: body.location,
        type: jobType,
        description: body.description ?? null,
        salaryMin: body.salaryMin ?? null,
        salaryMax: body.salaryMax ?? null,
        status: 'OPEN',
      },
    });
  }

  async updateJob(
    user: AuthUser,
    jobId: string,
    body: { title?: string; company?: string; location?: string; type?: string; description?: string; salaryMin?: number; salaryMax?: number; status?: string },
  ) {
    this.requireEmployer(user);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new NotFoundException('Job not found');
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.company !== undefined) data.company = body.company;
    if (body.location !== undefined) data.location = body.location;
    if (body.type !== undefined) data.type = body.type === 'INTERNSHIP' ? 'INTERNSHIP' : 'HIRING';
    if (body.description !== undefined) data.description = body.description;
    if (body.salaryMin !== undefined) data.salaryMin = body.salaryMin;
    if (body.salaryMax !== undefined) data.salaryMax = body.salaryMax;
    if (body.status !== undefined) data.status = body.status;

    return this.prisma.job.update({ where: { id: jobId }, data });
  }

  async deleteJob(user: AuthUser, jobId: string) {
    this.requireEmployer(user);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.update({ where: { id: jobId }, data: { status: 'ARCHIVED' } });
    return { message: 'Job archived successfully' };
  }

  async getEmployerProfile(user: AuthUser) {
    this.requireEmployer(user);
    const profile = await this.prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, role: true } });
    return profile ?? { id: user.id, email: user.email, role: user.role };
  }

  async updateEmployerProfile(user: AuthUser, body: { name: string; industry?: string; location?: string; description?: string }) {
    this.requireEmployer(user);

    const company = await this.prisma.company.upsert({
      where: { name: body.name },
      update: {
        industry: body.industry ?? null,
        location: body.location ?? null,
        description: body.description ?? null,
      },
      create: {
        name: body.name,
        industry: body.industry ?? null,
        location: body.location ?? null,
        description: body.description ?? null,
      },
    });

    return { id: company.id, name: company.name, industry: company.industry, location: company.location, description: company.description };
  }

  async listJobs(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireEmployer(user);
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { employerId: user.id };
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, title: true, company: true, location: true, type: true, status: true, description: true, salaryMin: true, salaryMax: true, createdAt: true },
      }),
      this.prisma.job.count({ where }),
    ]);
    return applyPagination(jobs, total, page, limit);
  }

  async getAnalytics(user: AuthUser) {
    this.requireEmployer(user);

    const activeJobs = await this.prisma.job.count({ where: { employerId: user.id, status: 'OPEN' } });
    const applicationsToday = await this.prisma.application.count({
      where: {
        job: { employerId: user.id },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    const views = await this.prisma.auditLog.count({ where: { userId: user.id, action: 'JOB_VIEW' } });
    const pendingInterviews = await this.prisma.application.count({
      where: { job: { employerId: user.id }, status: 'INTERVIEW' },
    });

    const totalApplications = await this.prisma.application.count({ where: { job: { employerId: user.id } } });
    const interviewed = await this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'INTERVIEW' } });
    const offered = await this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'OFFERED' } });
    const hired = await this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'HIRED' } });

    return {
      activeJobs,
      applicationsToday,
      views,
      pendingInterviews,
      hiringFunnel: [views, totalApplications, interviewed, offered, hired],
    };
  }

  async getInterviews(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireEmployer(user);
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { job: { employerId: user.id }, status: 'INTERVIEW' };
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true, status: true } },
          student: { include: { profile: { select: { id: true, name: true, focus: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = applications.map((a: { id: string; job: { title: string; company: string; location: string; type: string }; student: { profile: { name: string } | null; email: string }; createdAt: Date }) => ({
      id: a.id,
      job: a.job,
      candidate: a.student.profile?.name ?? a.student.email,
      scheduledAt: a.createdAt,
      status: 'SCHEDULED',
    }));
    return applyPagination(items, total, page, limit);
  }
}

