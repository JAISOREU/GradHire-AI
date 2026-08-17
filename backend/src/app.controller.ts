import { Body, Controller, Get, Param, Put, Query, Req, UseGuards, HttpStatus, Res } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './auth/auth.guard';
import { StudentGuard } from './auth/student.guard';
import { AuthUser } from './auth/auth.service';
import { AppService } from './app.service';
import { HealthService } from './health/health.service';
import { UpdateProfileDto } from './common/dto/profile.dto';
import { JobQueryDto } from './common/dto/job.dto';
import { normalizePagination } from './common/pagination';
import { RecommendationService, PersonalizedRecommendationsResult } from './ai/recommendation.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly healthService: HealthService, private readonly recommendationService: RecommendationService) {}

  @Get('health')
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.check();
    const statusCode = health.status === 'healthy' ? HttpStatus.OK : health.status === 'degraded' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(health);
  }

  @Get('jobs')
  async getJobs(@Query() query: JobQueryDto) {
    return this.appService.getJobs(query);
  }

  @Get('jobs/:id')
  async getJobById(@Param('id') id: string, @Req() req?: Request & { user: AuthUser }) {
    const requesterId = req?.user?.id;
    return this.appService.getJobById(id, requesterId);
  }

  @UseGuards(AuthGuard, StudentGuard)
  @Get('recommendations/ai')
  async getAiRecommendations(@Req() req: Request & { user: AuthUser }, @Query('top_k') topK = 5): Promise<PersonalizedRecommendationsResult> {
    const result = await this.recommendationService.getPersonalizedRecommendations(req.user.id, Number(topK));
    return result;
  }

  @UseGuards(AuthGuard, StudentGuard)
  @Get('students/me')
  async getStudentProfile(@Req() req: Request & { user: AuthUser }) {
    return this.appService.getStudentProfile(req.user.id);
  }

  @UseGuards(AuthGuard, StudentGuard)
  @Put('students/me')
  async saveStudentProfile(@Req() req: Request & { user: AuthUser }, @Body() body: UpdateProfileDto) {
    return this.appService.saveStudentProfile(req.user.id, body as unknown as Record<string, unknown>);
  }

  @UseGuards(AuthGuard, StudentGuard)
  @Get('saved-jobs/me')
  async mySavedJobs(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.appService.listSavedJobs(req.user.id, pagination);
  }
}
