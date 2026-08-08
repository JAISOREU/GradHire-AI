import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { EmployerService } from './employer.service';
import { CreateJobDto } from '../common/dto/job.dto';
import { UpdateProfileDto } from '../common/dto/profile.dto';
import { normalizePagination } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('employer')
@UseGuards(AuthGuard)
@Controller('employer')
export class EmployerController {
  constructor(private readonly employer: EmployerService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employer profile' })
  @ApiResponse({ status: 200, description: 'Employer profile' })
  async profile(@Req() req: Request & { user: AuthUser }) {
    return this.employer.getEmployerProfile(req.user);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update employer profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@Req() req: Request & { user: AuthUser }, @Body() body: UpdateProfileDto) {
    return this.employer.updateEmployerProfile(req.user, body);
  }

  @Post('jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job created' })
  async createJob(@Req() req: Request & { user: AuthUser }, @Body() body: CreateJobDto) {
    return this.employer.createJob(req.user, body);
  }

  @Put('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job posting' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  async updateJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: Partial<CreateJobDto>) {
    return this.employer.updateJob(req.user, id, body);
  }

  @Delete('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job posting' })
  @ApiResponse({ status: 200, description: 'Job deleted' })
  async deleteJob(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.employer.deleteJob(req.user, id);
  }

  @Get('jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List employer jobs' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved' })
  async myJobs(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.employer.listJobs(req.user, pagination);
  }

  @Get('analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employer analytics' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  async analytics(@Req() req: Request & { user: AuthUser }) {
    return this.employer.getAnalytics(req.user);
  }

  @Get('interviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employer interviews' })
  @ApiResponse({ status: 200, description: 'Interviews retrieved' })
  async interviews(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.employer.getInterviews(req.user, pagination);
  }
}

