import { Body, Controller, Get, Param, Post, Query, Req, UseGuards, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { EmployerGuard } from '../auth/employer.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from '../common/dto/application.dto';
import { normalizePagination } from '../common/pagination';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async apply(@Req() req: Request & { user: AuthUser }, @Body() body: CreateApplicationDto) {
    return this.applications.apply(req.user, body.jobId, body);
  }

  @Get('me')
  @UseGuards(StudentGuard)
  async myApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getMyApplications(req.user, pagination);
  }

  @Get('employer/all')
  @UseGuards(EmployerGuard)
  async allForEmployer(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    const jobId = typeof query?.jobId === 'string' ? query.jobId : undefined;
    return this.applications.listForEmployer(req.user, pagination, jobId);
  }

  @Get('status/:jobId')
  @UseGuards(StudentGuard)
  async hasApplied(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string) {
    return this.applications.hasApplied(req.user, jobId);
  }

  @Get(':id')
  async getById(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.getById(req.user, id);
  }

  @Get('job/:jobId')
  @UseGuards(EmployerGuard)
  async getForJob(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getForJob(req.user, jobId, pagination);
  }

  @Get('employer/job/:jobId')
  @UseGuards(EmployerGuard)
  async getForJobAlias(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getForJob(req.user, jobId, pagination);
  }

  @Post(':id/withdraw')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async withdraw(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.withdraw(req.user, id);
  }

  @Put(':id/status')
  @UseGuards(EmployerGuard)
  @Throttle({ default: { ttl: 60000, limit: 30 } })
  async updateStatus(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateApplicationStatusDto) {
    return this.applications.updateStatus(req.user, id, body);
  }
}
