import { Controller, Get, Param, Post, Query, Req, UseGuards, Body, Delete, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CompaniesService } from './companies.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { Request } from 'express';
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

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('search/employers')
  @UseGuards(AuthGuard)
  async searchEmployers(@Req() req: Request & { user: AuthUser }, @Query('q') q?: string) {
    if (!q || q.trim().length < 2) {
      return { items: [] };
    }
    return this.companies.searchEmployers(req.user.id, q.trim());
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Post(':id/follow')
  @UseGuards(AuthGuard)
  async follow(@Param('id') companyId: string, @Req() req: Request & { user: AuthUser }) {
    return this.companies.follow(req.user.id, companyId);
  }

  @Throttle({ default: { ttl: 60000, limit: 60 } })
  @Delete(':id/follow')
  @UseGuards(AuthGuard)
  async unfollow(@Param('id') companyId: string, @Req() req: Request & { user: AuthUser }) {
    return this.companies.unfollow(req.user.id, companyId);
  }

  @Throttle({ default: { ttl: 60000, limit: 30 } })
  @Get('me/following')
  @UseGuards(AuthGuard)
  async myFollowing(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.companies.findFollowing(req.user.id, pagination);
  }
}
