import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { JobSourcesService } from './job-sources.service';
import { CreateJobSourceDto, UpdateJobSourceDto, TestJobSourceDto } from './dto/job-source.dto';
import { PaginatedResponse, normalizePagination, applyPagination } from '../common/pagination';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModuleRef } from '@nestjs/core';

@ApiTags('admin/job-sources')
@ApiBearerAuth()
@Controller('admin/job-sources')
@UseGuards(AuthGuard, AdminGuard)
export class JobSourcesController {
  constructor(
    private readonly jobSourcesService: JobSourcesService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all job sources' })
  async findAll(@Query() query?: Record<string, unknown>): Promise<PaginatedResponse<any>> {
    const pagination = query ? normalizePagination(query) : undefined;
    const items = await this.jobSourcesService.findAll();
    const total = items.length;
    if (!pagination) {
      return applyPagination(items, total, 1, total);
    }
    const skip = (pagination.page - 1) * pagination.limit;
    const paged = items.slice(skip, skip + pagination.limit);
    return applyPagination(paged, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job source by ID' })
  async findOne(@Param('id') id: string) {
    return this.jobSourcesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create job source' })
  async create(@Body() dto: CreateJobSourceDto) {
    return this.jobSourcesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job source' })
  async update(@Param('id') id: string, @Body() dto: UpdateJobSourceDto) {
    return this.jobSourcesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job source' })
  async remove(@Param('id') id: string) {
    await this.jobSourcesService.remove(id);
    return { success: true };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test job source connectivity' })
  async test(@Param('id') id: string) {
    const pipeline = (await this.moduleRef.resolve('PIPELINE_SERVICE')) as any;
    const source = await this.jobSourcesService.findOne(id);
    return pipeline.testSource(source);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Manually trigger sync for a job source' })
  async sync(@Param('id') id: string) {
    const pipeline = (await this.moduleRef.resolve('PIPELINE_SERVICE')) as any;
    const source = await this.jobSourcesService.findOne(id);
    pipeline.runForSource(source).catch((err: unknown) => console.error(`Manual sync failed for source ${id}:`, err instanceof Error ? err.message : String(err)));
    return { message: 'Sync queued', sourceId: id };
  }

  @Get(':id/runs')
  @ApiOperation({ summary: 'Get recent ingestion runs for a source' })
  async getRuns(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.jobSourcesService.findRuns(id, limit ?? 20);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get health metrics for a source' })
  async getHealth(@Param('id') id: string) {
    return this.jobSourcesService.getHealth(id);
  }

  @Post('sync-all')
  @ApiOperation({ summary: 'Trigger sync for all enabled sources' })
  async syncAll() {
    const pipeline = (await this.moduleRef.resolve('PIPELINE_SERVICE')) as any;
    const sources = await this.jobSourcesService.findAll();
    const enabled = sources.filter((s) => s.enabled);
    enabled.forEach((s) => {
      pipeline.runForSource(s).catch((err: unknown) => console.error(`Bulk sync failed for source ${s.id}:`, err instanceof Error ? err.message : String(err)));
    });
    return { message: 'Sync queued for all enabled sources', count: enabled.length };
  }
}
