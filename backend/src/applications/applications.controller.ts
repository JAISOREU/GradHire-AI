import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApplicationsService } from './applications.service';
import { ApplyDto } from '../common/dto/application.dto';
import { normalizePagination } from '../common/pagination';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('applications')
@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a job' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate application' })
  async apply(@Req() req: Request & { user: AuthUser }, @Body() body: ApplyDto) {
    return this.applications.apply(req.user, body.jobId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user applications' })
  @ApiResponse({ status: 200, description: 'Applications retrieved' })
  async myApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    if (req.user.role === 'EMPLOYER') {
      return this.applications.getForEmployer(req.user, pagination);
    }
    return this.applications.getForStudent(req.user, pagination);
  }

  @Get('employer/all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all applications for employer' })
  @ApiResponse({ status: 200, description: 'Applications retrieved' })
  async employerApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getForEmployer(req.user, pagination);
  }

  @Post(':id/withdraw')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn' })
  async withdraw(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.withdraw(req.user, id);
  }
}
