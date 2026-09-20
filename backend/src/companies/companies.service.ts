import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';

export type CompanyFilters = {
  search?: string;
  industry?: string;
  location?: string;
  size?: string;
  remote?: boolean;
  hiring?: boolean;
};

export type DiscoverCompany = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
  size?: string;
  openPositions: number;
  followerCount: number;
  remoteAvailable: boolean;
};

@Injectable()
export class CompaniesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClient) {}

  async findAll(pagination?: PaginationParams, filters: CompanyFilters = {}): Promise<PaginatedResponse<DiscoverCompany> & { facets: { industries: string[]; locations: string[] } }> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where: Prisma.CompanyWhereInput = {
      ...(filters.search ? { name: { contains: filters.search, mode: 'insensitive' } } : {}),
      ...(filters.industry ? { industry: { contains: filters.industry, mode: 'insensitive' } } : {}),
      ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
      ...(filters.size ? { size: filters.size } : {}),
      ...(filters.remote ? { jobs: { some: { status: 'PUBLISHED', workplaceType: { in: ['REMOTE', 'HYBRID'] } } } } : {}),
      ...(filters.hiring ? { jobs: { some: { status: 'PUBLISHED' } } } : {}),
    };
    const [companies, total, industryRows, locationRows] = await Promise.all([
      this.prisma.company.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          industry: true,
          location: true,
          description: true,
          logo: true,
          size: true,
          _count: { select: { followers: true, jobs: { where: { status: 'PUBLISHED' } } } },
          jobs: { where: { status: 'PUBLISHED' }, select: { workplaceType: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({ distinct: ['industry'], select: { industry: true } }),
      this.prisma.company.findMany({ distinct: ['location'], select: { location: true } }),
    ]);
    const items: DiscoverCompany[] = companies.map((c) => ({
      id: c.id,
      name: c.name,
      industry: c.industry ?? undefined,
      location: c.location ?? undefined,
      description: c.description ?? undefined,
      logo: c.logo ?? undefined,
      size: c.size ?? undefined,
      openPositions: c._count.jobs,
      followerCount: c._count.followers,
      remoteAvailable: c.jobs.some((j) => j.workplaceType === 'REMOTE' || j.workplaceType === 'HYBRID'),
    }));
    return {
      ...applyPagination(items, total, page, limit),
      facets: {
        industries: industryRows.map((r) => r.industry).filter((v): v is string => Boolean(v)),
        locations: locationRows.map((r) => r.location).filter((v): v is string => Boolean(v)),
      },
    };
  }

  async hiringForSkills(userId: string): Promise<Array<{ skill: string; companies: number }>> {
    const profile = await this.prisma.profile.findUnique({ where: { userId }, select: { skills: true } });
    const skills = profile?.skills ?? [];
    const counts: Array<{ skill: string; companies: number }> = [];
    for (const skill of skills) {
      const grouped = await this.prisma.job.groupBy({
        by: ['companyId'],
        where: { status: 'PUBLISHED', companyId: { not: null }, requiredSkills: { has: skill } },
        _count: { _all: true },
      });
      if (grouped.length > 0) {
        counts.push({ skill, companies: grouped.length });
      }
    }
    counts.sort((a, b) => b.companies - a.companies || a.skill.localeCompare(b.skill));
    return counts.slice(0, 5);
  }

  async findOne(idOrName: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        OR: [{ id: idOrName }, { name: idOrName }],
      },
      include: { jobs: { where: { status: 'PUBLISHED' } } },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async searchEmployers(userId: string, q: string) {
    const companies = await this.prisma.company.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, industry: true, location: true },
      take: 10,
    });
    return { items: companies };
  }

  async follow(userId: string, companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.companyFollow.upsert({
      where: { userId_companyId: { userId, companyId } },
      create: { userId, companyId },
      update: {},
    });

    return { followed: true, companyId };
  }

  async unfollow(userId: string, companyId: string) {
    const existing = await this.prisma.companyFollow.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!existing) {
      throw new NotFoundException('Not following this company');
    }

    await this.prisma.companyFollow.delete({
      where: { userId_companyId: { userId, companyId } },
    });

    return { followed: false, companyId };
  }

  async findFollowing(userId: string, pagination?: PaginationParams) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const [items, total] = await Promise.all([
      this.prisma.companyFollow.findMany({
        where: { userId },
        include: { company: { select: { id: true, name: true, industry: true, location: true, description: true, logo: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.companyFollow.count({ where: { userId } }),
    ]);

    return applyPagination(
      items.map((f) => f.company),
      total,
      page,
      limit,
    );
  }
}
