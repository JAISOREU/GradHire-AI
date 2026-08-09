import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getJobAnalytics(user: AuthUser, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { analytics: true },
    });

    if (!job || job.employerId !== user.id) {
      throw new ForbiddenException('You can only view analytics for your own jobs');
    }

    if (!job.analytics) {
      const analytics = await this.prisma.jobAnalytics.create({
        data: { jobId },
      });
      return analytics;
    }

    return job.analytics;
  }

  async getEmployerDashboard(user: AuthUser) {
    this.requireEmployer(user);

    const [
      totalJobs,
      activeJobs,
      totalApplications,
      totalHired,
      totalRejected,
      totalWithdrawn,
      applicationsByStatus,
    ] = await Promise.all([
      this.prisma.job.count({ where: { employerId: user.id } }),
      this.prisma.job.count({ where: { employerId: user.id, status: 'PUBLISHED' } }),
      this.prisma.application.count({ where: { job: { employerId: user.id } } }),
      this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'HIRED' } }),
      this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'REJECTED' } }),
      this.prisma.application.count({ where: { job: { employerId: user.id }, status: 'WITHDRAWN' } }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { job: { employerId: user.id } },
        _count: { status: true },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalHired,
      totalRejected,
      totalWithdrawn,
      funnel: applicationsByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    };
  }

  private requireEmployer(user: AuthUser): void {
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('This action requires the EMPLOYER role');
    }
  }
}
