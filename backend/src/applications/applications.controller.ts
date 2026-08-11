import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, Put } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from '../common/dto/application.dto';
import { normalizePagination } from '../common/pagination';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  async apply(@Req() req: Request & { user: AuthUser }, @Body() body: CreateApplicationDto) {
    return this.applications.apply(req.user, body.jobId, body);
  }

  @Get('me')
  async myApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getMyApplications(req.user, pagination);
  }

  @Get('employer/all')
  async allForEmployer(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.listForEmployer(req.user, pagination);
  }

  @Get(':id')
  async getById(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.getById(req.user, id);
  }

  @Get('job/:jobId')
  async getForJob(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getForJob(req.user, jobId, pagination);
  }

  @Post(':id/withdraw')
  async withdraw(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.withdraw(req.user, id);
  }

  @Put(':id/status')
  async updateStatus(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateApplicationStatusDto) {
    return this.applications.updateStatus(req.user, id, body);
  }
}
