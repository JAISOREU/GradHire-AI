import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { EmployerService } from './employer.service';
import { CreateJobDto, UpdateJobDto } from '../common/dto/job.dto';
import { UpdateEmployerProfileDto } from '../common/dto/profile.dto';
import { normalizePagination } from '../common/pagination';

@UseGuards(AuthGuard)
@Controller('employer')
export class EmployerController {
  constructor(private readonly employer: EmployerService) {}

  @Get('profile')
  async profile(@Req() req: Request & { user: AuthUser }) {
    return this.employer.getEmployerProfile(req.user);
  }

  @Put('profile')
  async updateProfile(@Req() req: Request & { user: AuthUser }, @Body() body: UpdateEmployerProfileDto) {
    return this.employer.updateEmployerProfile(req.user, body);
  }

  @Post('jobs')
  async createJob(@Req() req: Request & { user: AuthUser }, @Body() body: CreateJobDto) {
    return this.employer.createJob(req.user, body);
  }

  @Put('jobs/:id')
  async updateJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: UpdateJobDto) {
    return this.employer.updateJob(req.user, id, body);
  }

  @Delete('jobs/:id')
  async deleteJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.employer.deleteJob(req.user, id);
  }

  @Get('jobs')
  async myJobs(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.employer.listJobs(req.user, pagination);
  }

  @Get('analytics')
  async analytics(@Req() req: Request & { user: AuthUser }) {
    return this.employer.getAnalytics(req.user);
  }

  @Get('interviews')
  async interviews(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.employer.getInterviews(req.user, pagination);
  }
}

