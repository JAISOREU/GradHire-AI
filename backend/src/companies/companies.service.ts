import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaginationParams, PaginatedResponse, applyPagination, normalizePagination } from '../common/pagination';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination?: PaginationParams) {
    const { page = 1, limit = 20 } = pagination ?? {};
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, industry: true, location: true, description: true, logo: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count(),
    ]);
    return applyPagination(companies, total, page, limit);
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
