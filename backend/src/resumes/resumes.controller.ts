import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { ResumesService } from './resumes.service';
import type { UploadedFile as ResumeFile } from './resume.types';
import { normalizePagination } from '../common/pagination';

@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async upload(
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file: ResumeFile | undefined,
  ) {
    if (!file) {
      return { error: 'No file uploaded. Please attach a resume file.' };
    }
    return this.resumes.uploadAndParse(req.user, file);
  }

  @Get('me')
  async myResumes(@Req() req: Request & { user: AuthUser }, @Query() query?: Record<string, unknown>) {
    const pagination = query ? normalizePagination(query) : undefined;
    return this.resumes.listMyResumes(req.user, pagination);
  }

  @Get(':id')
  async getOne(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.resumes.getResume(req.user, id);
  }
}

