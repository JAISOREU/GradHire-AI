import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AiService, AiRecommendation } from './ai/ai.service';
import { PaginationParams, PaginatedResponse, applyPagination } from './common/pagination';

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

  constructor(private readonly prisma: PrismaService, private readonly ai: AiService) {}

  async onModuleInit() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.dbAvailable = true;
      this.logger.log('PostgreSQL connection established');
    } catch {
      this.dbAvailable = false;
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

  async getJobs(type?: string, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; title: string; company: string; location: string; type: string; matchScore: number }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const scored = await this.loadJobs(type);
    const total = scored.length;
    const start = (page - 1) * limit;
    const items = scored.slice(start, start + limit);
    return applyPagination(items, total, page, limit);
  }

  async getAiRecommendations(focus: string, topK = 5): Promise<AiRecommendation[]> {
    return this.ai.getRecommendations(focus, topK);
  }

  async getStudentProfile(userId: string): Promise<{ id: string; name: string; focus: string; summary: string }> {
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
          };
        }
      } catch {
        this.logger.warn('DB read failed — returning in-memory profile');
      }
    }
    return this.profile;
  }

  async saveStudentProfile(userId: string, body: { name: string; focus: string }): Promise<{ id: string; name: string; focus: string; summary: string }> {
    const summary = `Focused on ${body.focus.toLowerCase()}.`;

    if (this.dbAvailable) {
      try {
        const saved = await this.prisma.profile.upsert({
          where: { userId },
          update: { name: body.name, focus: body.focus, summary },
          create: { userId, name: body.name, focus: body.focus, summary, skills: [] },
        });
        return { id: saved.id, name: saved.name, focus: saved.focus, summary: saved.summary ?? '' };
      } catch {
        this.logger.warn('DB write failed — saving to memory instead');
      }
    }

    this.profile = { ...this.profile, name: body.name, focus: body.focus, summary };
    return this.profile;
  }

  async getJobById(id: string): Promise<{ id: string; title: string; company: string; location: string; type: string; matchScore: number; description?: string; salaryMin?: number | null; salaryMax?: number | null; createdAt?: string }> {
    if (this.dbAvailable) {
      try {
        const dbJob = await this.prisma.job.findUnique({ where: { id } });
        if (dbJob) {
          const descriptions: Record<string, string> = {
            '1': 'Join our internship program to build real-world software engineering skills.',
            '2': 'Analyze business data and deliver actionable insights to stakeholders.',
            '3': 'Shape product experiences through user research and visual design.',
            '4': 'Work at the intersection of AI and product to ship impactful features.',
            '5': 'Build and scale full-stack products in a fast-moving team.',
          };
          const salaryMap: Record<string, { salaryMin: number | null; salaryMax: number | null }> = {
            '1': { salaryMin: 20, salaryMax: 30 },
            '2': { salaryMin: 55, salaryMax: 75 },
            '3': { salaryMin: 60, salaryMax: 85 },
            '4': { salaryMin: 70, salaryMax: 100 },
            '5': { salaryMin: 65, salaryMax: 95 },
          };
          const scored = this.computeMatchScores([{ id: dbJob.id, title: dbJob.title, company: dbJob.company, location: dbJob.location, type: String(dbJob.type), matchScore: 0 }]);
          const job = scored[0];
          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            matchScore: job.matchScore,
            description: descriptions[id] ?? 'No description provided.',
            salaryMin: salaryMap[id]?.salaryMin ?? null,
            salaryMax: salaryMap[id]?.salaryMax ?? null,
            createdAt: dbJob.createdAt.toISOString(),
          };
        }
      } catch {
        this.logger.warn('DB read failed — falling back to in-memory job lookup');
      }
    }

    const jobs = await this.getJobs();
    const job = jobs.items.find((j: { id: string }) => j.id === id);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    const descriptions: Record<string, string> = {
      '1': 'Join our internship program to build real-world software engineering skills.',
      '2': 'Analyze business data and deliver actionable insights to stakeholders.',
      '3': 'Shape product experiences through user research and visual design.',
      '4': 'Work at the intersection of AI and product to ship impactful features.',
      '5': 'Build and scale full-stack products in a fast-moving team.',
    };
    const salaryMap: Record<string, { salaryMin: number | null; salaryMax: number | null }> = {
      '1': { salaryMin: 20, salaryMax: 30 },
      '2': { salaryMin: 55, salaryMax: 75 },
      '3': { salaryMin: 60, salaryMax: 85 },
      '4': { salaryMin: 70, salaryMax: 100 },
      '5': { salaryMin: 65, salaryMax: 95 },
    };
    return {
      ...job,
      description: descriptions[id] ?? 'No description provided.',
      salaryMin: salaryMap[id]?.salaryMin ?? null,
      salaryMax: salaryMap[id]?.salaryMax ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  async listMessages(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; from: string; to: string; body: string; createdAt: string; read: boolean }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    if (this.dbAvailable) {
      try {
        const where = { OR: [{ senderId: userId }, { recipientId: userId }] as { senderId: string }[] };
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
          messages.map((m: { id: string; senderId: string; recipientId: string; body: string; createdAt: Date; read: boolean }) => ({
            id: m.id,
            from: m.senderId,
            to: m.recipientId,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
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

  async listSavedJobs(userId: string, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; job: { id: string; title: string; company: string; location: string; type: string }; savedAt: string }>> {
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
          saved.map((s: { id: string; job: { id: string; title: string; company: string; location: string; type: string }; createdAt: Date }) => ({
            id: s.id,
            job: { ...s.job, type: String(s.job.type) },
            savedAt: s.createdAt.toISOString(),
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

  private async loadJobs(typeFilter?: string): Promise<Array<{ id: string; title: string; company: string; location: string; type: string; matchScore: number }>> {
    if (this.dbAvailable) {
      try {
        const dbJobs = await this.prisma.job.findMany({
          select: { id: true, title: true, company: true, location: true, type: true },
        });
        if (dbJobs.length > 0) {
          return this.computeMatchScores(
            dbJobs.map((j: { id: string; title: string; company: string; location: string; type: string }) => ({ ...j, id: String(j.id), type: String(j.type), matchScore: 0 })),
            typeFilter,
          );
        }
      } catch {
        this.logger.warn('DB read failed — falling back to in-memory jobs');
      }
    }

    return this.computeMatchScores(
      [
        { id: '1', title: 'Software Engineer Intern', company: 'Northwind Labs', location: 'Remote', type: 'INTERNSHIP', matchScore: 0 },
        { id: '2', title: 'Data Analyst', company: 'Cedar AI', location: 'Austin, TX', type: 'HIRING', matchScore: 0 },
        { id: '3', title: 'Product Designer', company: 'BluePeak', location: 'New York, NY', type: 'HIRING', matchScore: 0 },
        { id: '4', title: 'AI Product Engineer', company: 'Lumina AI', location: 'Seattle, WA', type: 'HIRING', matchScore: 0 },
        { id: '5', title: 'Full-Stack Developer', company: 'BrightPath', location: 'Remote', type: 'HIRING', matchScore: 0 },
      ],
      typeFilter,
    );
  }

  private computeMatchScores(
    jobs: Array<{ id: string; title: string; company: string; location: string; type: string; matchScore: number }>,
    typeFilter?: string,
  ): Array<{ id: string; title: string; company: string; location: string; type: string; matchScore: number }> {
    const focus = this.profile.focus.toLowerCase();
    const focusTerms = focus.split(/\s+/);

    const filtered = typeFilter ? jobs.filter((job) => job.type === typeFilter.toUpperCase()) : jobs;

    return filtered
      .map((job) => {
        const title = job.title.toLowerCase();
        const company = job.company.toLowerCase();
        const matchCount = focusTerms.filter(
          (term) => title.includes(term) || company.includes(term),
        ).length;
        const dynamicScore = Math.min(Math.round((matchCount / focusTerms.length) * 100), 100);

        const dataBoost = focus.includes('data') || focus.includes('analytics') ? (title.includes('data') || title.includes('analytics') ? 20 : 0) : 0;
        const aiBoost = focus.includes('ai') || focus.includes('machine learning') ? (title.includes('ai') || title.includes('machine learning') ? 20 : 0) : 0;
        const designBoost = focus.includes('design') || focus.includes('product') ? (title.includes('product') || title.includes('design') ? 20 : 0) : 0;

        return { ...job, matchScore: Math.min(dynamicScore + dataBoost + aiBoost + designBoost, 100) };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
  
