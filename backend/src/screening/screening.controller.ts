import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { ScreeningService } from './screening.service';
import { CreateScreeningQuestionDto } from '../common/dto/screening.dto';

@Controller('screening')
@UseGuards(AuthGuard)
export class ScreeningController {
  constructor(private readonly screening: ScreeningService) {}

  @Post('questions')
  async createQuestion(@Req() req: Request & { user: AuthUser }, @Body() body: CreateScreeningQuestionDto) {
    return this.screening.create(req.user, body);
  }

  @Get('questions/job/:jobId')
  async getQuestions(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string) {
    return this.screening.getForJob(req.user, jobId);
  }

  @Put('questions/:id')
  async updateQuestion(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Body() body: Partial<CreateScreeningQuestionDto>) {
    return this.screening.update(req.user, id, body);
  }

  @Delete('questions/:id')
  async deleteQuestion(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.screening.delete(req.user, id);
  }
}
