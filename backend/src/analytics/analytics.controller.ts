import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { EmployerGuard } from '../auth/employer.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('jobs/:jobId')
  @UseGuards(EmployerGuard)
  async jobAnalytics(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string) {
    return this.analytics.getJobAnalytics(req.user, jobId);
  }

  @Get('dashboard')
  @UseGuards(EmployerGuard)
  async dashboard(@Req() req: Request & { user: AuthUser }) {
    return this.analytics.getEmployerDashboard(req.user);
  }
}
