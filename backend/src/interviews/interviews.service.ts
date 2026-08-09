import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { ScheduleInterviewDto } from '../common/dto/interview.dto';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async schedule(user: AuthUser, body: ScheduleInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { job: true },
    });

    if (!application || application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only schedule interviews for your own jobs');
    }

    const existing = await this.prisma.interview.findUnique({
      where: { applicationId: body.applicationId },
    });

    if (existing) {
      return this.prisma.interview.update({
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

    return interview;
  }

  async getMyInterviews(user: AuthUser) {
    return this.prisma.interview.findMany({
      where: {
        application: { studentId: user.id },
      },
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true, company: true, location: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getJobInterviews(user: AuthUser, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new ForbiddenException('You can only view interviews for your own jobs');
    }

    return this.prisma.interview.findMany({
      where: {
        application: { jobId },
      },
      include: {
        application: {
          include: {
            student: { include: { profile: { select: { id: true, name: true, focus: true } } } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async updateStatus(user: AuthUser, interviewId: string, body: { status: string; feedback?: string }) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: { include: { job: true } } },
    });

    if (!interview || interview.application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only update interviews for your own jobs');
    }

    const data: Record<string, unknown> = { status: body.status };
    if (body.feedback) data.feedback = body.feedback;
    if (body.status === 'COMPLETED') data.endTime = new Date();

    return this.prisma.interview.update({
      where: { id: interviewId },
      data,
    });
  }

  async cancel(user: AuthUser, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: { application: { include: { job: true } } },
    });

    if (!interview || interview.application.job.employerId !== user.id) {
      throw new ForbiddenException('You can only cancel interviews for your own jobs');
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'CANCELLED' },
    });
  }
}
