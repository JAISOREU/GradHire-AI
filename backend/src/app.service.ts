import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WorkAuthorizationStatus } from '@prisma/client';
import { AiService, AiRecommendation } from './ai/ai.service';
import { PaginationParams, PaginatedResponse, applyPagination } from './common/pagination';
import { CacheService } from './cache/cache.service';
import { JobQueryDto } from './common/dto/job.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private dbAvailable = false;

  private profile = {
    id: 'student-001',
    name: 'Ava Chen',
    focus: 'Full-stack development and AI products',
    summary: 'Interested in product engineering and AI-powered workflows.',
  };

  constructor(private readonly prisma: PrismaService, private readonly ai: AiService, private readonly cache: CacheService) {}

  async onModuleInit() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.dbAvailable = true;
      this.logger.log('PostgreSQL connection established');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.dbAvailable = false;
      console.error('[AppService] PostgreSQL check failed:', message);
      this.logger.warn('PostgreSQL unavailable — falling back to in-memory storage');
    }
  }

  getHealth(): { status: string; service: string; version: string } {
    return {
      status: 'ok',
      service: 'gradture-backend',
      version: '0.1.0',
    };
  }

  async getJobs(query: JobQueryDto): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = query;
    const cacheKey = `jobs:${JSON.stringify(query)}:${page}:${limit}`;
    const cached = await this.cache.get<PaginatedResponse<Record<string, unknown>>>(cacheKey);
    if (cached) {
      return cached;
    }

    const where: Record<string, unknown> = { status: 'PUBLISHED' };

    if (query.type) where.type = query.type;
    if (query.experienceLevel) where.experienceLevel = query.experienceLevel;
    if (query.workplaceType) where.workplaceType = query.workplaceType;
    if (query.country) where.country = query.country;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.freshGraduateFriendly !== undefined) {
      where.acceptsFreshGraduates = query.freshGraduateFriendly;
    }
    if (query.internship !== undefined) {
      where.type = query.internship ? 'INTERNSHIP' : { not: 'INTERNSHIP' };
    }
    if (query.salaryMin !== undefined) {
      where.OR = [
        { salaryMin: { gte: query.salaryMin } },
        { salaryUndisclosed: false, salaryMin: null },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder ?? 'desc';
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          type: true,
          experienceLevel: true,
          workplaceType: true,
          country: true,
          city: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
          salaryUndisclosed: true,
          requiredSkills: true,
          applicationDeadline: true,
          views: true,
          createdAt: true,
          companyRef: { select: { name: true, industry: true, logo: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    const items = jobs.map((j: Record<string, unknown>) => ({
      ...j,
      type: String(j.type),
      experienceLevel: String(j.experienceLevel),
      workplaceType: String(j.workplaceType),
    }));

    const result = applyPagination(items, total, page, limit);
    await this.cache.set(cacheKey, result, 30);
    return result;
  }

  async getJobById(id: string, requesterId?: string): Promise<Record<string, unknown>> {
    if (this.dbAvailable) {
      try {
        const dbJob = await this.prisma.job.findUnique({
          where: { id },
          include: {
            companyRef: true,
            location: true,
            skills: true,
            benefits: true,
            requirements: true,
            screeningQuestions: true,
            analytics: true,
          },
        });
        if (dbJob) {
          const isOwner = requesterId && dbJob.employerId === requesterId;
          if (dbJob.status !== 'PUBLISHED' && !isOwner) {
            throw new NotFoundException('Job not found');
          }
          return { ...dbJob, type: String(dbJob.type), experienceLevel: String(dbJob.experienceLevel), workplaceType: String(dbJob.workplaceType) };
        }
      } catch (error: unknown) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        this.logger.warn('DB read failed — falling back to in-memory job lookup');
      }
    }

    const jobs = await this.getJobs({});
    const job = jobs.items.find((j) => (j as Record<string, string>).id === id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async getAiRecommendations(focus: string, topK = 5): Promise<AiRecommendation[]> {
    return this.ai.getRecommendations(focus, topK);
  }

  async getStudentProfile(userId: string): Promise<Record<string, unknown>> {
    if (this.dbAvailable) {
      try {
        const dbProfile = await this.prisma.profile.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (dbProfile) {
          return {
            id: dbProfile.id,
            name: dbProfile.name,
            focus: dbProfile.focus,
            summary: dbProfile.summary ?? '',
            skills: dbProfile.skills ?? [],
            education: dbProfile.education ?? '',
            experience: dbProfile.experience ?? '',
            phone: dbProfile.phone ?? '',
            location: dbProfile.location ?? '',
            website: dbProfile.website ?? '',
            linkedin: dbProfile.linkedin ?? '',
            github: dbProfile.github ?? '',
            portfolio: dbProfile.portfolio ?? '',
            expectedSalary: dbProfile.expectedSalary ?? null,
            availability: dbProfile.availability ?? '',
            workAuthorization: dbProfile.workAuthorization ?? '',
            authorizedCountries: dbProfile.authorizedCountries ?? [],
            needsVisaSponsorship: dbProfile.needsVisaSponsorship ?? false,
            studentFriendly: dbProfile.studentFriendly ?? false,
            freshGraduate: dbProfile.freshGraduate ?? false,
            graduationYear: dbProfile.graduationYear ?? null,
            degree: dbProfile.degree ?? '',
            fieldOfStudy: dbProfile.fieldOfStudy ?? '',
            internshipAccepted: dbProfile.internshipAccepted ?? false,
            profileCompleted: dbProfile.profileCompleted ?? false,
          };
        }
      } catch {
        this.logger.warn('DB read failed — returning in-memory profile');
      }
    }
    return this.profile;
  }

  async saveStudentProfile(userId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    const summary = typeof body.focus === 'string' ? `Focused on ${body.focus.toLowerCase()}.` : '';
    const requiredFields = ['name', 'focus', 'skills', 'education', 'experience', 'phone', 'location', 'workAuthorization', 'degree', 'fieldOfStudy'] as const;
    const profileCompleted = requiredFields.every((field) => {
      const value = body[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    if (this.dbAvailable) {
      try {
        const saved = await this.prisma.profile.upsert({
          where: { userId },
          update: {
            name: body.name as string,
            focus: body.focus as string,
            summary,
            skills: (body.skills as string[]) ?? [],
            education: body.education as string | undefined,
            experience: body.experience as string | undefined,
            phone: body.phone as string | undefined,
            location: body.location as string | undefined,
            website: body.website as string | undefined,
            linkedin: body.linkedin as string | undefined,
            github: body.github as string | undefined,
            portfolio: body.portfolio as string | undefined,
            expectedSalary: body.expectedSalary as string | undefined,
            availability: body.availability as string | undefined,
            workAuthorization: body.workAuthorization as WorkAuthorizationStatus | undefined,
            authorizedCountries: (body.authorizedCountries as string[]) ?? [],
            needsVisaSponsorship: body.needsVisaSponsorship as boolean | undefined,
            studentFriendly: body.studentFriendly as boolean | undefined,
            freshGraduate: body.freshGraduate as boolean | undefined,
            graduationYear: body.graduationYear as string | undefined,
            degree: body.degree as string | undefined,
            fieldOfStudy: body.fieldOfStudy as string | undefined,
            internshipAccepted: body.internshipAccepted as boolean | undefined,
            profileCompleted,
          },
          create: {
            userId,
            name: body.name as string,
            focus: body.focus as string,
            summary,
            skills: (body.skills as string[]) ?? [],
            education: body.education as string | undefined,
            experience: body.experience as string | undefined,
            phone: body.phone as string | undefined,
            location: body.location as string | undefined,
            website: body.website as string | undefined,
            linkedin: body.linkedin as string | undefined,
            github: body.github as string | undefined,
            portfolio: body.portfolio as string | undefined,
            expectedSalary: body.expectedSalary as string | undefined,
            availability: body.availability as string | undefined,
            workAuthorization: body.workAuthorization as WorkAuthorizationStatus | undefined,
            authorizedCountries: (body.authorizedCountries as string[]) ?? [],
            needsVisaSponsorship: body.needsVisaSponsorship as boolean | undefined,
            studentFriendly: body.studentFriendly as boolean | undefined,
            freshGraduate: body.freshGraduate as boolean | undefined,
            graduationYear: body.graduationYear as string | undefined,
            degree: body.degree as string | undefined,
            fieldOfStudy: body.fieldOfStudy as string | undefined,
            internshipAccepted: body.internshipAccepted as boolean | undefined,
            profileCompleted,
          },
        });
        return {
          id: saved.id,
          name: saved.name,
          focus: saved.focus,
          summary: saved.summary ?? '',
          skills: saved.skills ?? [],
          education: saved.education ?? '',
          experience: saved.experience ?? '',
          phone: saved.phone ?? '',
          location: saved.location ?? '',
          website: saved.website ?? '',
          linkedin: saved.linkedin ?? '',
          github: saved.github ?? '',
          portfolio: saved.portfolio ?? '',
          expectedSalary: saved.expectedSalary ?? null,
          availability: saved.availability ?? '',
          workAuthorization: saved.workAuthorization ?? '',
          authorizedCountries: saved.authorizedCountries ?? [],
          needsVisaSponsorship: saved.needsVisaSponsorship ?? false,
          studentFriendly: saved.studentFriendly ?? false,
          freshGraduate: saved.freshGraduate ?? false,
          graduationYear: saved.graduationYear ?? null,
          degree: saved.degree ?? '',
          fieldOfStudy: saved.fieldOfStudy ?? '',
          internshipAccepted: saved.internshipAccepted ?? false,
          profileCompleted: saved.profileCompleted ?? false,
        };
      } catch {
        this.logger.warn('DB write failed — saving to memory instead');
      }
    }

    this.profile = { ...this.profile, name: body.name as string, focus: body.focus as string, summary };
    return this.profile;
  }

  async listMessages(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    if (this.dbAvailable) {
      try {
        const where = { OR: [{ senderId: userId }, { recipientId: userId }] };
        const [messages, total] = await Promise.all([
          this.prisma.message.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.message.count({ where }),
        ]);
        return applyPagination(
          messages.map((m: Record<string, unknown>) => ({
            id: m.id,
            from: m.senderId,
            to: m.recipientId,
            body: m.body,
            createdAt: m.createdAt,
            read: m.read,
          })),
          total,
          page,
          limit,
        );
      } catch {
        this.logger.warn('DB read failed — returning empty messages');
      }
    }
    return applyPagination([], 0, page, limit);
  }

  async listSavedJobs(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    if (this.dbAvailable) {
      try {
        const where = { userId };
        const [saved, total] = await Promise.all([
          this.prisma.savedJob.findMany({
            where,
            include: { job: { select: { id: true, title: true, company: true, location: true, type: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.savedJob.count({ where }),
        ]);
        return applyPagination(
          saved.map((s: Record<string, unknown>) => ({
            id: s.id,
            job: { ...(s.job as Record<string, unknown>), type: String((s.job as Record<string, unknown>).type) },
            savedAt: s.createdAt,
          })),
          total,
          page,
          limit,
        );
      } catch {
        this.logger.warn('DB read failed — returning empty saved jobs');
      }
    }
    return applyPagination([], 0, page, limit);
  }
}
