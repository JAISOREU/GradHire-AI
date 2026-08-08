import { Injectable, NotFoundException } from '@nestjs/common';
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
      include: { jobs: { where: { status: 'OPEN' } } },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
}
