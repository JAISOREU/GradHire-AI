import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth.service';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@UseGuards(AuthGuard, AdminGuard)
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  async getMetrics(@Req() req: Request & { user: AuthUser }) {
    return this.metrics.getMetrics();
  }
}
