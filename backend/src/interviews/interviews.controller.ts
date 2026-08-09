import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { InterviewsService } from './interviews.service';
import { ScheduleInterviewDto } from '../common/dto/interview.dto';
import { normalizePagination } from '../common/pagination';

@Controller('interviews')
@UseGuards(AuthGuard)
export class InterviewsController {
  constructor(private readonly interviews: InterviewsService) {}

  @Post('schedule')
  async schedule(@Req() req: Request & { user: AuthUser }, @Body() body: ScheduleInterviewDto) {
    return this.interviews.schedule(req.user, body);
  }

  @Get('me')
  async myInterviews(@Req() req: Request & { user: AuthUser }) {
    return this.interviews.getMyInterviews(req.user);
  }

  @Get('job/:jobId')
  async jobInterviews(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.interviews.getJobInterviews(req.user, jobId);
  }

  @Put(':id/status')
  async updateStatus(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: { status: string; feedback?: string }) {
    return this.interviews.updateStatus(req.user, id, body);
  }

  @Delete(':id')
  async cancel(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.interviews.cancel(req.user, id);
  }
}
