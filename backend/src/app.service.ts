import { Injectable, Logger, OnModuleInit, NotFoundException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { WorkAuthorizationStatus } from '@prisma/client';
import { AiService } from './ai/ai.service';
import { AiRecommendation } from './ai/ai.types';
import { PaginationParams, PaginatedResponse, applyPagination } from './common/pagination';
import { CacheService } from './cache/cache.service';
import { JobQueryDto } from './common/dto/job.dto';
import { sanitizeDatabaseString } from './common/utils/sanitize';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private dbAvailable = false;

  constructor(private readonly prisma: PrismaService, private readonly ai: AiService, private readonly cache: CacheService) {}

  private assertDbAvailable(): void {
    if (!this.dbAvailable && process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Database connection failed');
    }
  }

  private normalizeDate(value: unknown): Date | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      return value;
    }
    if (typeof value !== 'string') {
      throw new BadRequestException('Invalid date format');
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      date = new Date(`${trimmed}T00:00:00.000Z`);
    } else {
      date = new Date(trimmed);
    }
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return date;
  }

  private normalizeDates(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    const normalized: Record<string, unknown> = { ...data };
    for (const field of fields) {
      if (field in data) {
        normalized[field] = this.normalizeDate(data[field]);
      }
    }
    return normalized;
  }

  private sanitizeStrings(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeDatabaseString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? sanitizeDatabaseString(item) : item,
        );
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private allowlist(data: Record<string, unknown>, allowedFields: string[]): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in data) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }

  async onModuleInit() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.dbAvailable = true;
      this.logger.log('PostgreSQL connection established');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.dbAvailable = false;
      console.error('[AppService] PostgreSQL check failed:', message);
      this.logger.warn('PostgreSQL unavailable — app will start but database-dependent features may fail');
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
        { companyRef: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.freshGraduateFriendly !== undefined) {
      where.acceptsFreshGraduates = query.freshGraduateFriendly;
    }
    if (query.internship !== undefined) {
      where.type = query.internship ? 'INTERNSHIP' : { not: 'INTERNSHIP' };
    }
    if (query.salaryMin !== undefined || query.salaryMax !== undefined) {
      const salaryConditions: Record<string, unknown>[] = [];
      if (query.salaryMin !== undefined) {
        salaryConditions.push({ salaryMin: { gte: query.salaryMin } });
      }
      if (query.salaryMax !== undefined) {
        salaryConditions.push({ salaryMax: { lte: query.salaryMax } });
      }
      salaryConditions.push({ salaryUndisclosed: false });
      if (where.OR) {
        where.OR = [...(where.OR as Record<string, unknown>[]), ...salaryConditions];
      } else {
        where.OR = salaryConditions;
      }
    }

    const orderBy: Record<string, string> = {};
    const sortField = query.sortBy || query.sort;
    if (sortField) {
      orderBy[sortField] = query.sortOrder ?? 'desc';
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
          location: { select: { city: true, country: true, region: true } },
          isExternal: true,
          applicationUrl: true,
          sourceName: true,
          sourceUrl: true,
          sourceJobId: true,
          importedAt: true,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    const items = jobs.map((j: Record<string, unknown>) => {
      const loc = j.location as Record<string, string> | undefined;
      const locationStr = loc
        ? [loc.city, loc.region, loc.country].filter(Boolean).join(', ')
        : [j.city, j.country].filter(Boolean).join(', ') || 'Remote';
      const companyRef = j.companyRef as Record<string, string> | undefined;
      const company = j.company || companyRef?.name || '';
      return {
        ...j,
        company,
        location: locationStr || 'Remote',
        type: String(j.type),
        experienceLevel: String(j.experienceLevel),
        workplaceType: String(j.workplaceType),
      };
    });

    const result = applyPagination(items, total, page, limit);
    await this.cache.set(cacheKey, result, 30);
    return result;
  }

  async getJobById(id: string, requesterId?: string): Promise<Record<string, unknown>> {
    this.assertDbAvailable();
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
    if (!dbJob) {
      throw new NotFoundException('Job not found');
    }
    const isOwner = requesterId && dbJob.employerId === requesterId;
    if (dbJob.status !== 'PUBLISHED' && !isOwner) {
      throw new NotFoundException('Job not found');
    }
    const companyRef = dbJob.companyRef as Record<string, string> | null;
    return {
      ...dbJob,
      type: String(dbJob.type),
      experienceLevel: String(dbJob.experienceLevel),
      workplaceType: String(dbJob.workplaceType),
      company: dbJob.company || companyRef?.name || '',
      location: dbJob.location
        ? [dbJob.location.city, dbJob.location.region, dbJob.location.country].filter(Boolean).join(', ')
        : [dbJob.city, dbJob.country].filter(Boolean).join(', ') || 'Remote',
      isExternal: dbJob.isExternal,
      applicationUrl: dbJob.applicationUrl,
      sourceName: dbJob.sourceName,
      sourceUrl: dbJob.sourceUrl,
      sourceJobId: dbJob.sourceJobId,
      importedAt: dbJob.importedAt,
    };
  }

  async getAiRecommendations(focus: string, topK = 5): Promise<AiRecommendation[]> {
    if (this.ai.isReady()) {
      try {
        return await this.ai.getRecommendations(focus, topK);
      } catch {
        // fall through to legacy
      }
    }
    try {
      return await this.ai.getRecommendations(focus, topK);
    } catch {
      return [];
    }
  }

  async getStudentProfile(userId: string): Promise<Record<string, unknown>> {
    this.assertDbAvailable();
    const dbProfile = await this.prisma.profile.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!dbProfile) {
      throw new NotFoundException('Profile not found');
    }
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

  async saveStudentProfile(userId: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.assertDbAvailable();
    const existing = await this.prisma.profile.findFirst({ where: { userId } });
    const summary = typeof body.focus === 'string' && !existing ? `Focused on ${body.focus.toLowerCase()}.` : (existing?.summary ?? '');
    const requiredFields = ['name', 'focus', 'skills', 'education', 'experience', 'phone', 'location', 'workAuthorization', 'degree', 'fieldOfStudy'] as const;
    const profileCompleted = requiredFields.every((field) => {
      const value = body[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });

    const merged: Record<string, unknown> = {
      name: (body.name as string) || existing?.name || '',
      focus: (body.focus as string) || existing?.focus || '',
      summary: (summary != null ? summary : existing?.summary) ?? '',
      skills: (body.skills as string[]) ?? existing?.skills ?? [],
      education: (body.education as string) ?? existing?.education ?? undefined,
      experience: (body.experience as string) ?? existing?.experience ?? undefined,
      phone: (body.phone as string) ?? existing?.phone ?? undefined,
      location: (body.location as string) ?? existing?.location ?? undefined,
      website: (body.website as string) ?? existing?.website ?? undefined,
      linkedin: (body.linkedin as string) ?? existing?.linkedin ?? undefined,
      github: (body.github as string) ?? existing?.github ?? undefined,
      portfolio: (body.portfolio as string) ?? existing?.portfolio ?? undefined,
      expectedSalary: (body.expectedSalary as string) ?? existing?.expectedSalary ?? undefined,
      availability: (body.availability as string) ?? existing?.availability ?? undefined,
      workAuthorization: (body.workAuthorization as WorkAuthorizationStatus) ?? existing?.workAuthorization ?? undefined,
      authorizedCountries: (body.authorizedCountries as string[]) ?? existing?.authorizedCountries ?? [],
      needsVisaSponsorship: (body.needsVisaSponsorship as boolean) ?? existing?.needsVisaSponsorship ?? false,
      studentFriendly: (body.studentFriendly as boolean) ?? existing?.studentFriendly ?? false,
      freshGraduate: (body.freshGraduate as boolean) ?? existing?.freshGraduate ?? false,
      graduationYear: (body.graduationYear as string) ?? existing?.graduationYear ?? undefined,
      degree: (body.degree as string) ?? existing?.degree ?? undefined,
      fieldOfStudy: (body.fieldOfStudy as string) ?? existing?.fieldOfStudy ?? undefined,
      internshipAccepted: (body.internshipAccepted as boolean) ?? existing?.internshipAccepted ?? false,
      profileCompleted,
    };

    const sanitized = this.sanitizeStrings(merged);

    const saved = await this.prisma.profile.upsert({
      where: { userId },
      update: sanitized,
      create: {
        userId,
        name: (sanitized.name as string) || '',
        focus: (sanitized.focus as string) || '',
        ...sanitized,
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
  }

  // ============================================================
  // Structured Profile Sections
  // ============================================================

  async getEducations(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return [];
    try {
      return this.prisma.education.findMany({ where: { userId }, orderBy: { startDate: 'desc' } });
    } catch {
      return [];
    }
  }

  async createEducation(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const normalized = this.normalizeDates(data, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.education.create({ data: { userId, ...sanitized } as any });
  }

  async updateEducation(userId: string, educationId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.education.findFirst({ where: { id: educationId, userId } });
    if (!existing) throw new NotFoundException('Education not found');
    const allowed = this.allowlist(data, ['institution', 'degree', 'fieldOfStudy', 'startDate', 'endDate', 'currentlyStudying', 'description']);
    const normalized = this.normalizeDates(allowed, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.education.update({ where: { id: educationId }, data: sanitized as any });
  }

  async deleteEducation(userId: string, educationId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.education.findFirst({ where: { id: educationId, userId } });
    if (!existing) throw new NotFoundException('Education not found');
    await this.prisma.education.delete({ where: { id: educationId } });
    return { success: true };
  }

  async getExperiences(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return [];
    try {
      return this.prisma.experience.findMany({ where: { userId }, orderBy: { startDate: 'desc' } });
    } catch {
      return [];
    }
  }

  async createExperience(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const normalized = this.normalizeDates(data, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.experience.create({ data: { userId, ...sanitized } as any });
  }

  async updateExperience(userId: string, experienceId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.experience.findFirst({ where: { id: experienceId, userId } });
    if (!existing) throw new NotFoundException('Experience not found');
    const allowed = this.allowlist(data, ['jobTitle', 'company', 'employmentType', 'location', 'startDate', 'endDate', 'currentlyWorking', 'description', 'skillsUsed']);
    const normalized = this.normalizeDates(allowed, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.experience.update({ where: { id: experienceId }, data: sanitized as any });
  }

  async deleteExperience(userId: string, experienceId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.experience.findFirst({ where: { id: experienceId, userId } });
    if (!existing) throw new NotFoundException('Experience not found');
    await this.prisma.experience.delete({ where: { id: experienceId } });
    return { success: true };
  }

  async getSkills(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return [];
    try {
      return this.prisma.skill.findMany({ where: { userId }, orderBy: { name: 'asc' } });
    } catch {
      return [];
    }
  }

  async createSkill(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const name = sanitizeDatabaseString(String(data.name ?? '').trim());
    if (!name) throw new NotFoundException('Skill name is required');
    const normalizedName = name.toLowerCase();
    const existing = await this.prisma.skill.findFirst({ where: { userId, name: { equals: normalizedName, mode: 'insensitive' } } });
    if (existing) {
      return this.prisma.skill.update({ where: { id: existing.id }, data: { ...this.sanitizeStrings(data), name: normalizedName } as any });
    }
    return this.prisma.skill.create({ data: { userId, name: normalizedName, ...this.sanitizeStrings(data) } as any });
  }

  async deleteSkill(userId: string, skillId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.skill.findFirst({ where: { id: skillId, userId } });
    if (!existing) throw new NotFoundException('Skill not found');
    await this.prisma.skill.delete({ where: { id: skillId } });
    return { success: true };
  }

  async getCertifications(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return [];
    try {
      return this.prisma.certification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    } catch {
      return [];
    }
  }

  async createCertification(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const normalized = this.normalizeDates(data, ['issuedAt', 'expiresAt']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.certification.create({ data: { userId, ...sanitized } as any });
  }

  async updateCertification(userId: string, certificationId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.certification.findFirst({ where: { id: certificationId, userId } });
    if (!existing) throw new NotFoundException('Certification not found');
    const allowed = this.allowlist(data, ['name', 'issuer', 'issuedAt', 'expiresAt', 'credentialId', 'url']);
    const normalized = this.normalizeDates(allowed, ['issuedAt', 'expiresAt']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.certification.update({ where: { id: certificationId }, data: sanitized as any });
  }

  async deleteCertification(userId: string, certificationId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.certification.findFirst({ where: { id: certificationId, userId } });
    if (!existing) throw new NotFoundException('Certification not found');
    await this.prisma.certification.delete({ where: { id: certificationId } });
    return { success: true };
  }

  async getProjects(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return [];
    try {
      return this.prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    } catch {
      return [];
    }
  }

  async createProject(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const normalized = this.normalizeDates(data, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.project.create({ data: { userId, ...sanitized } as any });
  }

  async updateProject(userId: string, projectId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!existing) throw new NotFoundException('Project not found');
    const allowed = this.allowlist(data, ['name', 'description', 'url', 'startDate', 'endDate', 'skillsUsed']);
    const normalized = this.normalizeDates(allowed, ['startDate', 'endDate']);
    const sanitized = this.sanitizeStrings(normalized);
    return this.prisma.project.update({ where: { id: projectId }, data: sanitized as any });
  }

  async deleteProject(userId: string, projectId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!existing) throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }

  async getCareerPreference(userId: string) {
    this.assertDbAvailable();
    if (!this.dbAvailable) return null;
    try {
      return this.prisma.careerPreference.findFirst({ where: { userId } });
    } catch {
      return null;
    }
  }

  async upsertCareerPreference(userId: string, data: Record<string, unknown>) {
    this.assertDbAvailable();
    if (!this.dbAvailable) throw new ServiceUnavailableException('Database unavailable');
    const existing = await this.prisma.careerPreference.findFirst({ where: { userId } });
    const sanitized = this.sanitizeStrings(data);
    if (existing) {
      return this.prisma.careerPreference.update({ where: { id: existing.id }, data: sanitized as any });
    }
    return this.prisma.careerPreference.create({ data: { userId, ...sanitized } as any });
  }

  async getProfileCompleteness(userId: string) {
    this.assertDbAvailable();
    const profile = await this.prisma.profile.findFirst({ where: { userId } });
    if (!profile) return { percentage: 0, missing: ['profile'] };

    const sections: { key: string; weight: number; filled: boolean }[] = [];
    const missing: string[] = [];

    const check = (label: string, filled: boolean, weight = 1) => {
      sections.push({ key: label, weight, filled });
      if (!filled) missing.push(label);
    };

    check('Personal Information', Boolean(profile.name && profile.name.trim()));
    check('Professional Headline', Boolean(profile.focus && profile.focus.trim()));
    check('About', Boolean(profile.summary && profile.summary.trim()));
    check('Phone', Boolean(profile.phone && profile.phone.trim()));
    check('Location', Boolean(profile.location && profile.location.trim()));
    check('Resume', (await this.prisma.resume.findFirst({ where: { userId } })) !== null, 2);
    check('Education', (await this.prisma.education.findFirst({ where: { userId } })) !== null, 2);
    check('Experience', (await this.prisma.experience.findFirst({ where: { userId } })) !== null, 2);
    check('Skills', (await this.prisma.skill.findFirst({ where: { userId } })) !== null, 2);
    check('Career Preferences', (await this.prisma.careerPreference.findFirst({ where: { userId } })) !== null);

    const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
    const filledWeight = sections.filter(s => s.filled).reduce((sum, s) => sum + s.weight, 0);
    const percentage = Math.round((filledWeight / totalWeight) * 100);

    return { percentage, missing, sections };
  }

  async getAiReadiness(userId: string) {
    this.assertDbAvailable();
    const profile = await this.prisma.profile.findFirst({ where: { userId } });
    if (!profile) {
      return { ready: false, missing: ['profile'] };
    }

    const checks: { key: string; required: boolean; ready: boolean }[] = [];
    const missing: string[] = [];

    const education = await this.prisma.education.findFirst({ where: { userId } });
    const hasEducation = education !== null;
    checks.push({ key: 'Education', required: true, ready: hasEducation });
    if (!hasEducation) missing.push('education');

    const skills = await this.prisma.skill.findFirst({ where: { userId } });
    const hasSkills = skills !== null;
    checks.push({ key: 'Skills', required: true, ready: hasSkills });
    if (!hasSkills) missing.push('skills');

    const experience = await this.prisma.experience.findFirst({ where: { userId } });
    const hasExperience = experience !== null;
    checks.push({ key: 'Experience', required: true, ready: hasExperience });
    if (!hasExperience) missing.push('experience');

    const resume = await this.prisma.resume.findFirst({ where: { userId } });
    const hasResume = resume !== null;
    checks.push({ key: 'Resume', required: false, ready: hasResume });
    if (!hasResume) missing.push('resume');

    const preferences = await this.prisma.careerPreference.findFirst({ where: { userId } });
    const hasPreferences = preferences !== null;
    checks.push({ key: 'Career Preferences', required: false, ready: hasPreferences });
    if (!hasPreferences) missing.push('career_preferences');

    const ready = checks.filter(c => c.required).every(c => c.ready);

    return { ready, missing, checks };
  }

  async listMessages(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.assertDbAvailable();
    const { page = 1, limit = 20 } = pagination ?? {};
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
  }

  async listSavedJobs(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<Record<string, unknown>>> {
    this.assertDbAvailable();
    const { page = 1, limit = 20 } = pagination ?? {};
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
  }

  async saveJob(userId: string, jobId: string): Promise<{ id: string }> {
    this.assertDbAvailable();
    try {
      const saved = await this.prisma.savedJob.create({
        data: { userId, jobId },
      });
      return { id: saved.id };
    } catch (error: unknown) {
      if ((error as any)?.code === 'P2002') {
        const existing = await this.prisma.savedJob.findFirst({ where: { userId, jobId } });
        if (existing) {
          return { id: existing.id };
        }
      }
      throw error;
    }
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    this.assertDbAvailable();
    await this.prisma.savedJob.deleteMany({
      where: { userId, jobId },
    });
  }

  async isJobSaved(userId: string, jobId: string): Promise<{ saved: boolean }> {
    this.assertDbAvailable();
    const count = await this.prisma.savedJob.count({ where: { userId, jobId } });
    return { saved: count > 0 };
  }
}
