import { Body, Controller, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './auth/auth.guard';
import { AuthUser } from './auth/auth.service';
import { AppService } from './app.service';
import { HealthService } from './health/health.service';
import { UpdateProfileDto } from './common/dto/profile.dto';
import { JobQueryDto } from './common/dto/job.dto';
import { normalizePagination } from './common/pagination';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly healthService: HealthService) {}

  @Get('health')
  async getHealth() {
    return this.healthService.check();
  }

  @Get('jobs')
  async getJobs(@Query() query: JobQueryDto) {
    return this.appService.getJobs(query);
  }

  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return this.appService.getJobById(id);
  }

  @UseGuards(AuthGuard)
  @Get('recommendations/ai')
  async getAiRecommendations(@Req() req: Request & { user: AuthUser }, @Query('top_k') topK = 5) {
    const profile = await this.appService.getStudentProfile(req.user.id);
    return this.appService.getAiRecommendations(profile.focus, Number(topK));
  }

  @UseGuards(AuthGuard)
  @Get('students/me')
  async getStudentProfile(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getStudentProfile(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Put('students/me')
  async saveStudentProfile(@Req() req: Request & { user: AuthUser }, @Body() body: UpdateProfileDto) {
    return this.appService.saveStudentProfile(req.user.id, body);
  }

  @UseGuards(AuthGuard)
  @Get('saved-jobs/me')
  async mySavedJobs(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.appService.listSavedJobs(req.user.id, pagination);
  }
}
