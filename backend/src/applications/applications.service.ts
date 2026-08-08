import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private readonly prisma: PrismaService, private readonly email: EmailService, private readonly notifications: NotificationsService) {}

  async apply(user: AuthUser, jobId: string): Promise<Record<string, unknown>> {
    this.requireRole(user, 'STUDENT');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const existing = await this.prisma.application.findUnique({
      where: { studentId_jobId: { studentId: user.id, jobId } },
    });
    if (existing) {
      throw new BadRequestException('You have already applied to this job');
    }

    const application = await this.prisma.application.create({
      data: {
        studentId: user.id,
        jobId,
        status: 'APPLIED',
      },
    });

    const message = `New application received for "${job.title}" at ${job.company}.`;
    await this.notifications.create(job.employerId, message, application.id);

    const employer = await this.prisma.user.findUnique({
      where: { id: job.employerId },
      select: { email: true },
    });

    if (employer) {
      const emailResult = await this.email.send({
        to: employer.email,
        subject: `New application: ${job.title} at ${job.company}`,
        text: `A student applied to "${job.title}" at ${job.company}.\n\nApplication submitted via GradHire AI.`,
        html: `<p>A student applied to <strong>${job.title}</strong> at ${job.company}.</p><p>Application submitted via GradHire AI.</p>`,
      });

      await this.prisma.emailEvent.create({
        data: {
          applicationId: application.id,
          recipientId: job.employerId,
          recipientEmail: employer.email,
          subject: `New application: ${job.title} at ${job.company}`,
          body: `A student applied to "${job.title}" at ${job.company}.\n\nApplication submitted via GradHire AI.`,
          status: emailResult.status,
          sentAt: emailResult.status === 'SENT' ? new Date() : null,
        },
      });
    }

    return {
      id: application.id,
      jobId,
      status: application.status,
      createdAt: application.createdAt,
    };
  }

  async getForStudent(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireRole(user, 'STUDENT');
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { studentId: user.id };
    const [apps, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);
    const items = apps.map((a) => ({
      id: a.id,
      status: a.status,
      createdAt: a.createdAt,
      job: a.job,
    }));
    return applyPagination(items, total, page, limit);
  }

  async getForEmployer(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireRole(user, 'EMPLOYER');
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { job: { employerId: user.id } };
    const [apps, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true } },
          student: {
            include: { profile: { select: { id: true, name: true, focus: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);
    const items = apps.map((a) => ({
      id: a.id,
      status: a.status,
      createdAt: a.createdAt,
      job: a.job,
      student: a.student.profile
        ? { id: a.student.profile.id, name: a.student.profile.name, focus: a.student.profile.focus }
        : null,
    }));
    return applyPagination(items, total, page, limit);
  }

  async withdraw(user: AuthUser, applicationId: string): Promise<{ id: string; status: string }> {
    this.requireRole(user, 'STUDENT');
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application || application.studentId !== user.id) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
    });
    return { id: updated.id, status: updated.status };
  }

  private requireRole(user: AuthUser, role: string): void {
    if (user.role !== role) {
      throw new ForbiddenException(`This action requires the ${role} role`);
    }
  }
}

