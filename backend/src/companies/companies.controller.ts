import { Controller, Get, Param, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CompaniesService } from './companies.service';
import { normalizePagination } from '../common/pagination';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Get()
  async findAll(@Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.companies.findAll(pagination);
  }

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companies.findOne(id);
  }
}
