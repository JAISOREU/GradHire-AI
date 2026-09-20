import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { ScheduleInterviewDto } from '../common/dto/interview.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PaginationParams, applyPagination } from '../common/pagination';
import { employerStudentSelect, redactStudentForEmployer } from '../common/profile-visibility';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  async schedule(user: AuthUser, body: ScheduleInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { job: true, student: { select: { id: true } } },
    });

    if (!application || application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only schedule interviews for your own jobs');
    }

    const existing = await this.prisma.interview.findUnique({
      where: { applicationId: body.applicationId },
    });

    if (existing) {
      const interview = await this.prisma.interview.update({
        where: { applicationId: body.applicationId },
        data: {
          type: body.type,
          scheduledAt: new Date(body.scheduledAt),
          durationMinutes: body.durationMinutes ?? 60,
          timezone: body.timezone,
          location: body.location,
          meetingLink: body.meetingLink,
          interviewers: body.interviewers ?? [],
          notes: body.notes,
          status: 'SCHEDULED',
        },
      });

      await this.prisma.applicationEvent.create({
        data: {
          applicationId: body.applicationId,
          actorId: user.id,
          actorRole: 'EMPLOYER',
          action: 'INTERVIEW_RESCHEDULED',
          metadata: { interviewId: interview.id, scheduledAt: body.scheduledAt },
        },
      });

      await this.notifications.create(application.student.id, `Interview rescheduled for ${application.job.title}`, body.applicationId, 'INTERVIEW');

      return interview;
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        type: body.type,
        scheduledAt: new Date(body.scheduledAt),
        durationMinutes: body.durationMinutes ?? 60,
        timezone: body.timezone,
        location: body.location,
        meetingLink: body.meetingLink,
        interviewers: body.interviewers ?? [],
        notes: body.notes,
        status: 'SCHEDULED',
      },
    });

    await this.prisma.applicationEvent.create({
      data: {
        applicationId: body.applicationId,
        actorId: user.id,
        actorRole: 'EMPLOYER',
        action: 'INTERVIEW_SCHEDULED',
        metadata: { interviewId: interview.id, scheduledAt: body.scheduledAt },
      },
    });

    await this.notifications.create(application.student.id, `Interview scheduled for ${application.job.title}`, body.applicationId, 'INTERVIEW');

    return interview;
  }

  async getMyInterviews(user: AuthUser, pagination?: PaginationParams) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = {
      application: { studentId: user.id },
    };
    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: {
            include: {
              job: { select: { id: true, title: true, company: true, location: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return applyPagination(interviews, total, page, limit);
  }

  async getEmployerInterviews(user: AuthUser, pagination?: PaginationParams) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = {
      application: { job: { employerId: user.id } },
    };
    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: {
            include: {
              student: { select: employerStudentSelect },
              job: { select: { id: true, title: true, company: true, location: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.interview.count({ where }),
    ]);

    const items = interviews.map((i: Record<string, unknown>) => ({
      ...i,
      application: { ...(i.application as Record<string, unknown>), student: redactStudentForEmployer((i.application as Record<string, unknown>).student as never) },
    }));

    return applyPagination(items, total, page, limit);
  }

  async getJobInterviews(user: AuthUser, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.employerId !== user.id) {
      throw new ForbiddenException('You can only view interviews for your own jobs');
    }

    const interviews = await this.prisma.interview.findMany({
      where: {
        application: { jobId },
      },
      include: {
        application: {
          include: {
            student: { select: employerStudentSelect },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return interviews.map((i: Record<string, unknown>) => ({
      ...i,
      application: { ...(i.application as Record<string, unknown>), student: redactStudentForEmployer((i.application as Record<string, unknown>).student as never) },
    }));
  }

  async updateStatus(user: AuthUser, interviewId: string, body: { status: string; feedback?: string }) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: { include: { job: true, student: { select: { id: true } } } } },
    });

    if (!interview || interview.application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only update interviews for your own jobs');
    }

    const data: Record<string, unknown> = { status: body.status };
    if (body.feedback) data.feedback = body.feedback;
    if (body.status === 'COMPLETED') data.endTime = new Date();

    const updated = await this.prisma.interview.update({
      where: { id: interviewId },
      data,
    });

    await this.prisma.applicationEvent.create({
      data: {
        applicationId: interview.applicationId,
        actorId: user.id,
        actorRole: 'EMPLOYER',
        action: `INTERVIEW_${body.status}`,
        metadata: { interviewId },
      },
    });

    await this.notifications.create(interview.application.student.id, `Interview ${body.status.toLowerCase()} for ${interview.application.job.title}`, interview.applicationId, 'INTERVIEW');

    return updated;
  }

  async cancel(user: AuthUser, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: { include: { job: true, student: { select: { id: true } } } } },
    });

    if (!interview || interview.application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only cancel interviews for your own jobs');
    }

    const updated = await this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.applicationEvent.create({
      data: {
        applicationId: interview.applicationId,
        actorId: user.id,
        actorRole: 'EMPLOYER',
        action: 'INTERVIEW_CANCELLED',
        metadata: { interviewId },
      },
    });

    await this.notifications.create(interview.application.student.id, `Interview cancelled for ${interview.application.job.title}`, interview.applicationId, 'INTERVIEW');

    return updated;
  }
}
