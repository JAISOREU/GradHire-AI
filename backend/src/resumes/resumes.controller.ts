import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { ResumesService } from './resumes.service';
import type { UploadedFile as ResumeFile } from './resume.types';
import { normalizePagination } from '../common/pagination';

@Controller('resumes')
@UseGuards(AuthGuard, StudentGuard)
export class ResumesController {
  constructor(private readonly resumes: ResumesService) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async upload(
    @Req() req: Request & { user: AuthUser },
    @UploadedFile() file: ResumeFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach a resume file.');
    }
    return this.resumes.uploadAndParse(req.user, file);
  }

  @Put(':id')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async replace(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
    @UploadedFile() file: ResumeFile | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please attach a resume file.');
    }
    return this.resumes.replaceResume(req.user, id, file);
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

  @Get(':id/download')
  async download(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Res() res: any) {
    const file = await this.resumes.getResumeFile(req.user, id);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      'Content-Length': file.buffer.length,
    });
    res.send(file.buffer);
  }

  @Get(':id/view')
  async view(@Req() req: Request & { user: AuthUser }, @Param('id') id: string, @Res() res: any) {
    const file = await this.resumes.getResumeFile(req.user, id);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(file.fileName)}"`,
      'Content-Length': file.buffer.length,
    });
    res.send(file.buffer);
  }

  @Delete(':id')
  async delete(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.resumes.deleteResume(req.user, id);
  }
}
