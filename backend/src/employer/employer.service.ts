import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { PaginationParams, PaginatedResponse, applyPagination } from '../common/pagination';
import { CreateJobDto, UpdateJobDto } from '../common/dto/job.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class EmployerService {
  private readonly logger = new Logger(EmployerService.name);

  constructor(private readonly prisma: PrismaService, private readonly cache: CacheService) {}

  private requireEmployer(user: AuthUser): void {
    if (user.role !== 'EMPLOYER') {
      throw new ForbiddenException('This action requires the EMPLOYER role');
    }
  }

  async createJob(user: AuthUser, body: CreateJobDto) {
    this.requireEmployer(user);

    if (body.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: body.companyId } });
      if (!company) {
        throw new BadRequestException('Invalid company');
      }
    }

    const data: Record<string, unknown> = {
      employerId: user.id,
      title: body.title,
      company: body.company,
      type: body.type,
      experienceLevel: body.experienceLevel,
      positions: body.positions ?? 1,
      description: body.description,
      responsibilities: body.responsibilities,
      requiredQualifications: body.requiredQualifications,
      preferredQualifications: body.preferredQualifications,
      requiredSkills: body.requiredSkills,
      preferredSkills: body.preferredSkills ?? [],
      status: body.status ?? 'DRAFT',
      workplaceType: body.workplaceType,
      remoteScope: body.remoteScope,
      remoteCountries: body.remoteCountries ?? [],
      remoteRegions: body.remoteRegions ?? [],
      remoteCities: body.remoteCities ?? [],
      requiredTimezone: body.requiredTimezone,
      timezoneOverlap: body.timezoneOverlap,
      expectedOfficeAttendance: body.expectedOfficeAttendance,
      country: body.country,
      region: body.region,
      city: body.city,
      postalCode: body.postalCode,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      workScheduleType: body.workScheduleType,
      workingDays: body.workingDays,
      startTime: body.startTime,
      endTime: body.endTime,
      flexibleHours: body.flexibleHours ?? false,
      requiredOverlapHours: body.requiredOverlapHours,
      nightShift: body.nightShift ?? false,
      weekendWork: body.weekendWork ?? false,
      onCallRequired: body.onCallRequired ?? false,
      salaryType: body.salaryType,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      currency: body.currency ?? 'PHP',
      payFrequency: body.payFrequency,
      negotiable: body.negotiable ?? false,
      salaryUndisclosed: body.salaryUndisclosed ?? false,
      bonus: body.bonus,
      commission: body.commission,
      equity: body.equity,
      overtime: body.overtime,
      otherCompensation: body.otherCompensation,
      acceptsFreshGraduates: body.acceptsFreshGraduates ?? true,
      acceptsStudents: body.acceptsStudents ?? true,
      requiredGraduationYear: body.requiredGraduationYear,
      degreeRequired: body.degreeRequired,
      fieldOfStudyRequired: body.fieldOfStudyRequired,
      noExperienceRequired: body.noExperienceRequired ?? true,
      internshipAccepted: body.internshipAccepted ?? true,
      applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined,
      hiringTargetDate: body.hiringTargetDate ? new Date(body.hiringTargetDate) : undefined,
      companyId: body.companyId,
    };

    if (data.status === 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    const job = await this.prisma.job.create({ data: data as any });

    if (body.location) {
      await this.prisma.jobLocation.create({
        data: {
          jobId: job.id,
          ...body.location,
        } as any,
      });
    }

    if (body.skills?.length) {
      await this.prisma.jobSkill.createMany({
        data: body.skills.map((s) => ({ jobId: job.id, name: s.name, required: s.required ?? true })),
      });
    }

    if (body.benefits?.length) {
      await this.prisma.jobBenefit.createMany({
        data: body.benefits.map((b) => ({ jobId: job.id, name: b, custom: false })),
      });
    }

    if (body.requirements?.length) {
      await this.prisma.jobRequirement.createMany({
        data: body.requirements.map((r, i) => ({ jobId: job.id, type: r.type as any, description: r.description, order: i })),
      });
    }

    await this.cache.invalidate('jobs:*');

    return job;
  }

  async updateJob(user: AuthUser, jobId: string, body: UpdateJobDto) {
    this.requireEmployer(user);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new NotFoundException('Job not found');
    }

    if (body.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: body.companyId } });
      if (!company) {
        throw new BadRequestException('Invalid company');
      }
    }

    const data: Record<string, unknown> = {};
    const fields: (keyof UpdateJobDto)[] = [
      'title', 'company', 'department', 'type', 'experienceLevel', 'positions',
      'description', 'responsibilities', 'requiredQualifications', 'preferredQualifications',
      'requiredSkills', 'preferredSkills', 'status', 'featured',
      'workplaceType', 'remoteScope', 'remoteCountries', 'remoteRegions', 'remoteCities',
      'requiredTimezone', 'timezoneOverlap', 'expectedOfficeAttendance',
      'country', 'region', 'city', 'postalCode', 'address', 'latitude', 'longitude', 'timezone',
      'workScheduleType', 'workingDays', 'startTime', 'endTime', 'flexibleHours',
      'requiredOverlapHours', 'nightShift', 'weekendWork', 'onCallRequired',
      'salaryType', 'salaryMin', 'salaryMax', 'currency', 'payFrequency',
      'negotiable', 'salaryUndisclosed', 'bonus', 'commission', 'equity', 'overtime', 'otherCompensation',
      'acceptsFreshGraduates', 'acceptsStudents', 'requiredGraduationYear',
      'degreeRequired', 'fieldOfStudyRequired', 'noExperienceRequired', 'internshipAccepted',
      'applicantCountVisible', 'autoCloseAfterDeadline',
      'companyId',
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.applicationDeadline !== undefined) {
      data.applicationDeadline = body.applicationDeadline ? new Date(body.applicationDeadline) : null;
    }
    if (body.hiringTargetDate !== undefined) {
      data.hiringTargetDate = body.hiringTargetDate ? new Date(body.hiringTargetDate) : null;
    }
    if (body.status === 'PUBLISHED' && job.status !== 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    await this.cache.invalidate('jobs:*');

    return this.prisma.job.update({ where: { id: jobId }, data: data as any });
  }

  async deleteJob(user: AuthUser, jobId: string) {
    this.requireEmployer(user);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new NotFoundException('Job not found');
    }

    await this.cache.invalidate('jobs:*');

    await this.prisma.job.update({ where: { id: jobId }, data: { status: 'ARCHIVED' } });
    return { message: 'Job archived successfully' };
  }

  async getEmployerProfile(user: AuthUser) {
    this.requireEmployer(user);
    const profile = await this.prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, role: true, employerProfile: true } });
    return profile ?? { id: user.id, email: user.email, role: user.role };
  }

  async updateEmployerProfile(user: AuthUser, body: { companyName: string; industry?: string; location?: string; description?: string; website?: string; phone?: string }) {
    this.requireEmployer(user);

    const profile = await this.prisma.employerProfile.upsert({
      where: { userId: user.id },
      update: {
        companyName: body.companyName,
        industry: body.industry ?? null,
        location: body.location ?? null,
        description: body.description ?? null,
        website: body.website ?? null,
        phone: body.phone ?? null,
      },
      create: {
        userId: user.id,
        companyName: body.companyName,
        industry: body.industry,
        location: body.location,
        description: body.description,
        website: body.website,
        phone: body.phone,
      },
    });

    return profile;
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
        include: {
          companyRef: { select: { name: true, industry: true, logo: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);
    return applyPagination(jobs, total, page, limit);
  }

  async getAnalytics(user: AuthUser) {
    this.requireEmployer(user);

    const activeJobs = await this.prisma.job.count({ where: { employerId: user.id, status: 'PUBLISHED' } });
    const applicationsToday = await this.prisma.application.count({
      where: {
        job: { employerId: user.id },
        submittedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      } as any,
    });

    const grouped = await this.prisma.application.groupBy({
      by: ['status'],
      where: { job: { employerId: user.id } },
      _count: { status: true },
    });

    const counts: Record<string, number> = {};
    for (const row of grouped) {
      counts[row.status] = row._count.status;
    }

    const totalApplications = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const awaitingReview = counts['UNDER_REVIEW'] ?? 0;
    const shortlisted = counts['SHORTLISTED'] ?? 0;
    const interviewing = counts['INTERVIEW'] ?? 0;
    const offers = counts['OFFER'] ?? 0;
    const hired = counts['HIRED'] ?? 0;
    const rejected = counts['REJECTED'] ?? 0;
    const withdrawn = counts['WITHDRAWN'] ?? 0;

    const views = await this.prisma.job.aggregate({
      where: { employerId: user.id, status: 'PUBLISHED' },
      _sum: { views: true },
    });

    return {
      activeJobs,
      applicationsToday,
      views: views._sum.views ?? 0,
      pendingInterviews: interviewing,
      totalApplications,
      awaitingReview,
      shortlisted,
      interviewing,
      offers,
      hired,
      rejected,
      withdrawn,
      hiringFunnel: [
        totalApplications,
        awaitingReview + shortlisted,
        interviewing,
        offers,
        hired,
      ],
    };
  }

  async getInterviews(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.requireEmployer(user);
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { job: { employerId: user.id } };
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true, status: true } },
          student: { include: { profile: { select: { id: true, name: true, focus: true } } } },
          interview: true,
        },
        orderBy: { createdAt: 'desc' } as any,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const items = applications.map((a) => ({
      id: a.id,
      job: a.job,
      candidate: (a.student as { profile: { name: string } | null })?.profile?.name ?? (a.student as { email: string }).email,
      interview: a.interview,
      status: a.status,
      createdAt: (a as any).createdAt,
    }));
    return applyPagination(items, total, page, limit);
  }
}
