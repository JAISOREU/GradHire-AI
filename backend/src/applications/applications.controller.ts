import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApplicationsService } from './applications.service';
import { ApplyDto } from '../common/dto/application.dto';
import { normalizePagination } from '../common/pagination';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  async apply(@Req() req: Request & { user: AuthUser }, @Body() body: ApplyDto) {
    return this.applications.apply(req.user, body.jobId);
  }

  @Get('me')
  async myApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    if (req.user.role === 'EMPLOYER') {
      return this.applications.getForEmployer(req.user, pagination);
    }
    return this.applications.getForStudent(req.user, pagination);
  }

  @Get('employer/all')
  async employerApplications(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.applications.getForEmployer(req.user, pagination);
  }

  @Post(':id/withdraw')
  async withdraw(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.applications.withdraw(req.user, id);
  }
}
