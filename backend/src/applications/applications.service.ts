import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination } from '../common/pagination';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(private readonly prisma: PrismaService, private readonly email: EmailService, private readonly notifications: NotificationsService) {}

  async apply(user: AuthUser, jobId: string, body: { coverLetter?: string; resumeId?: string }): Promise<Record<string, unknown>> {
    this.requireRole(user, 'STUDENT');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'PUBLISHED') {
      throw new BadRequestException('This job is not open for applications');
    }

    const existing = await this.prisma.application.findUnique({
      where: { studentId_jobId: { studentId: user.id, jobId } },
    });
    if (existing) {
      throw new BadRequestException('You have already applied to this job');
    }

    const resume = body.resumeId ? await this.prisma.resume.findUnique({ where: { id: body.resumeId } }) : null;

    const application = await this.prisma.application.create({
      data: {
        studentId: user.id,
        jobId,
        status: 'SUBMITTED',
        coverLetter: body.coverLetter ?? null,
        resumeVersionId: resume?.id ?? null,
        resumeSnapshot: resume ? JSON.stringify({ fileName: resume.fileName, fileUrl: resume.fileUrl }) : null,
        statusHistory: {
          create: {
            newStatus: 'SUBMITTED',
            actorId: user.id,
            actorRole: 'STUDENT',
            message: 'Application submitted',
          },
        },
        events: {
          create: {
            actorId: user.id,
            actorRole: 'STUDENT',
            action: 'APPLICATION_SUBMITTED',
            metadata: { jobId, jobTitle: job.title },
          },
        },
      },
      include: { statusHistory: true, events: true },
    });

    await this.notifications.create(job.employerId, `New application received for "${job.title}" at ${job.company}`, application.id, 'APPLICATION');

    const employer = await this.prisma.user.findUnique({
      where: { id: job.employerId },
      select: { email: true },
    });

    if (employer) {
      try {
        const emailResult = await this.email.send({
          to: employer.email,
          subject: `New application: ${job.title} at ${job.company}`,
          text: `A candidate applied to "${job.title}" at ${job.company}.\n\nApplication submitted via Gradture AI.`,
          html: `<p>A candidate applied to <strong>${job.title}</strong> at ${job.company}.</p><p>Application submitted via Gradture AI.</p>`,
        });

        await this.prisma.emailEvent.create({
          data: {
            applicationId: application.id,
            recipientId: job.employerId,
            recipientEmail: employer.email,
            subject: `New application: ${job.title} at ${job.company}`,
            body: `A candidate applied to "${job.title}" at ${job.company}.\n\nApplication submitted via Gradture AI.`,
            status: emailResult.status,
            sentAt: emailResult.status === 'SENT' ? new Date() : null,
          },
        });
      } catch (emailError) {
        this.logger.warn(`Notification email failed: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      }
    }

    return {
      id: application.id,
      jobId,
      status: application.status,
      createdAt: (application as any).createdAt,
    };
  }

  async getMyApplications(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireRole(user, 'STUDENT');
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { studentId: user.id };
    const [apps, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              location: true,
              type: true,
              workplaceType: true,
              salaryMin: true,
              salaryMax: true,
              currency: true,
              salaryUndisclosed: true,
              status: true,
            },
          },
          statusHistory: { orderBy: { createdAt: 'desc' } as any, take: 1 },
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = apps.map((a: Record<string, unknown>) => ({
      id: a.id,
      status: a.status,
      submittedAt: a.createdAt,
      lastUpdated: a.lastStatusChangeAt,
      job: a.job,
      lastEvent: (a.statusHistory as any)?.[0],
    }));

    return applyPagination(items, total, page, limit);
  }

  async getById(user: AuthUser, applicationId: string): Promise<Record<string, unknown>> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { createdAt: 'desc' } },
        documents: true,
        answers: { include: { question: true } },
        interview: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const isStudent = application.studentId === user.id;
    const isEmployer = application.job.employerId === user.id;

    if (!isStudent && !isEmployer) {
      throw new ForbiddenException('You do not have access to this application');
    }

    if (isEmployer && !application.viewedAt) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: { viewedAt: new Date() },
      });
      await this.prisma.applicationEvent.create({
        data: {
          applicationId,
          actorId: user.id,
          actorRole: 'EMPLOYER',
          action: 'EMPLOYER_VIEWED_APPLICATION',
        },
      });
    }

    return {
      ...application,
      job: { ...application.job, type: String(application.job.type) },
    };
  }

  async getForJob(user: AuthUser, jobId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new ForbiddenException('You can only view applications for your own jobs');
    }

    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { jobId };
    const [apps, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          student: { include: { profile: { select: { id: true, name: true, focus: true, skills: true } } } },
          statusHistory: { orderBy: { createdAt: 'desc' } as any, take: 1 },
          interview: true,
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = apps.map((a: Record<string, unknown>) => ({
      id: a.id,
      status: a.status,
      submittedAt: a.createdAt,
      viewedAt: a.viewedAt,
      student: a.student,
      lastEvent: (a.statusHistory as any)?.[0],
      interview: a.interview,
    }));

    return applyPagination(items, total, page, limit);
  }

  private readonly ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
    SUBMITTED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    UNDER_REVIEW: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
    SHORTLISTED: ['INTERVIEW', 'ASSESSMENT', 'REJECTED', 'WITHDRAWN'],
    INTERVIEW: ['ASSESSMENT', 'OFFER', 'REJECTED', 'WITHDRAWN'],
    ASSESSMENT: ['OFFER', 'REJECTED', 'WITHDRAWN'],
    OFFER: ['HIRED', 'REJECTED', 'WITHDRAWN'],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: [],
  };

  async updateStatus(user: AuthUser, applicationId: string, body: { status: ApplicationStatus; message?: string }): Promise<Record<string, unknown>> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.employerId !== user.id) {
      throw new ForbiddenException('Only the employer can update application status');
    }

    const previousStatus = application.status;
    const allowed = this.ALLOWED_TRANSITIONS[previousStatus] ?? [];
    if (!allowed.includes(body.status)) {
      throw new BadRequestException(`Cannot transition from ${previousStatus} to ${body.status}`);
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: body.status,
        lastStatusChangeAt: new Date(),
        ...(body.status === 'REJECTED' ? { rejectedAt: new Date() } : {}),
        ...(body.status === 'HIRED' ? { hiredAt: new Date() } : {}),
        statusHistory: {
          create: {
            previousStatus,
            newStatus: body.status,
            actorId: user.id,
            actorRole: 'EMPLOYER',
            message: body.message ?? null,
          },
        },
        events: {
          create: {
            actorId: user.id,
            actorRole: 'EMPLOYER',
            action: `STATUS_CHANGED_${body.status}`,
            metadata: { previousStatus, newStatus: body.status, message: body.message },
          },
        },
      },
      include: { statusHistory: true },
    });

    await this.notifications.create(application.studentId, `Your application for "${application.job.title}" has been updated to ${body.status}`, applicationId, 'APPLICATION');

    return { id: updated.id, status: updated.status, previousStatus };
  }

  async withdraw(user: AuthUser, applicationId: string): Promise<{ id: string; status: string }> {
    this.requireRole(user, 'STUDENT');
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application || application.studentId !== user.id) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (['HIRED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      throw new BadRequestException(`Cannot withdraw an application with status ${application.status}`);
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'WITHDRAWN',
        withdrawnAt: new Date(),
        lastStatusChangeAt: new Date(),
        statusHistory: {
          create: {
            previousStatus: application.status,
            newStatus: 'WITHDRAWN',
            actorId: user.id,
            actorRole: 'STUDENT',
            message: 'Application withdrawn by candidate',
          },
        },
        events: {
          create: {
            actorId: user.id,
            actorRole: 'STUDENT',
            action: 'APPLICATION_WITHDRAWN',
            metadata: { previousStatus: application.status },
          },
        },
      },
    });

    await this.notifications.create(application.job.employerId, `A candidate withdrew their application for "${application.job.title}"`, applicationId, 'APPLICATION');

    return { id: updated.id, status: updated.status };
  }

  async listForEmployer(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { job: { employerId: user.id } };
    const [apps, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          student: { include: { profile: { select: { id: true, name: true, focus: true, skills: true } } } },
          job: { select: { id: true, title: true, company: true } },
          statusHistory: { orderBy: { createdAt: 'desc' } as any, take: 1 },
          interview: true,
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = apps.map((a: Record<string, unknown>) => ({
      id: a.id,
      status: a.status,
      submittedAt: a.submittedAt,
      viewedAt: a.viewedAt,
      student: a.student,
      job: a.job,
      lastEvent: (a.statusHistory as any)?.[0],
      interview: a.interview,
    }));

    return applyPagination(items, total, page, limit);
  }

  private requireRole(user: AuthUser, role: string): void {
    if (user.role !== role) {
      throw new ForbiddenException(`This action requires the ${role} role`);
    }
  }
}
