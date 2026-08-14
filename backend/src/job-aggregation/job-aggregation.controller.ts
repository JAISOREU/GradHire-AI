import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { JobAggregationService } from './job-aggregation.service';
import { Request } from 'express';

@Controller('admin/job-aggregation')
@UseGuards(AuthGuard)
export class JobAggregationController {
  constructor(private readonly aggregation: JobAggregationService) {}

  private async assertAdmin(@Req() req: Request & { user: AuthUser }) {
    if (req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Admin access required');
    }
  }

  @Get('dashboard')
  async dashboard(@Req() req: Request & { user: AuthUser }) {
    await this.assertAdmin(req);
    return this.aggregation.getDashboard();
  }

  @Get('sources')
  async sources(@Req() req: Request & { user: AuthUser }) {
    await this.assertAdmin(req);
    return this.aggregation.listSources();
  }

  @Post('sources')
  async createSource(@Req() req: Request & { user: AuthUser }, @Body() body: Record<string, unknown>) {
    await this.assertAdmin(req);
    return this.aggregation.createSource(body);
  }

  @Put('sources/:id')
  async updateSource(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    await this.assertAdmin(req);
    return this.aggregation.updateSource(id, body);
  }

  @Post('sources/:id/crawl')
  async triggerCrawl(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    await this.assertAdmin(req);
    return this.aggregation.triggerCrawl(id);
  }

  @Get('jobs')
  async jobs(@Req() req: Request & { user: AuthUser }, @Query() query: Record<string, unknown>) {
    await this.assertAdmin(req);
    const page = typeof query.page === 'string' ? Number(query.page) : 1;
    const limit = typeof query.limit === 'string' ? Number(query.limit) : 20;
    return this.aggregation.listAggregatedJobs(page, limit);
  }

  @Get('jobs/:id')
  async jobDetail(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    await this.assertAdmin(req);
    return this.aggregation.getAggregatedJob(id);
  }

  @Post('jobs/:id/approve')
  async approveJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    await this.assertAdmin(req);
    return this.aggregation.approveJob(id, req.user.id);
  }

  @Post('jobs/:id/reject')
  async rejectJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    await this.assertAdmin(req);
    return this.aggregation.rejectJob(id, req.user.id);
  }

  @Post('jobs/:id/retry')
  async retryJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    await this.assertAdmin(req);
    return this.aggregation.retryJob(id);
  }
}
