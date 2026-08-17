import { Injectable, Logger, BadRequestException, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { parseResumeText, extractTextFromFile } from './resume.parser';
import type { UploadedFile } from './resume.types';
import { PaginationParams, PaginatedResponse, applyPagination } from '../common/pagination';
import { IStorageService } from '../storage/storage.service';
import { STORAGE_SERVICE } from '../storage/storage.module';
import { sanitizeDatabaseString, sanitizeFilename } from '../common/utils/sanitize';
import { FileValidationService } from './file-validation.service';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
    private readonly fileValidator: FileValidationService,
  ) {}

  async uploadAndParse(user: AuthUser, file: UploadedFile): Promise<{
    resume: { id: string; fileName: string; fileUrl: string; mimeType: string | null; fileSize: number | null };
    profile: { id: string; name: string; focus: string; summary: string | null; skills: string[] };
  }> {
    if (user.role !== 'STUDENT') {
      throw new BadRequestException('Only talent can upload resumes');
    }

    const validation = this.fileValidator.validate(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(' '));
    }

    const safeFileName = sanitizeDatabaseString(validation.sanitizedFilename);
    const safeStorageKey = sanitizeFilename(validation.sanitizedFilename);
    const storageKey = `resumes/${user.id}/${Date.now()}-${safeStorageKey}`;

    let fileUrl: string;
    try {
      fileUrl = await this.storage.upload(file, storageKey);
    } catch (err) {
      this.logger.error('Storage upload failed', err);
      throw new BadRequestException('Failed to upload resume. Please try again.');
    }

    try {
      let rawText: string;
      try {
        rawText = await extractTextFromFile(file);
      } catch (err) {
        this.logger.error('Text extraction failed', err);
        await this.storage.remove(storageKey);
        throw new BadRequestException('Could not extract text from the file. It may be corrupted or password-protected.');
      }

      const cleanedText = sanitizeDatabaseString(rawText.slice(0, 50_000));
      if (!cleanedText || cleanedText.trim().length < 20) {
        await this.storage.remove(storageKey);
        throw new BadRequestException(
          'The file appears to contain insufficient text. Please upload a resume with at least a few lines of readable content.',
        );
      }

      const parsed = parseResumeText(cleanedText);

      const resume = await this.prisma.resume.create({
        data: {
          userId: user.id,
          fileName: safeFileName,
          fileUrl,
          mimeType: sanitizeDatabaseString(validation.detectedMime),
          fileSize: file.size,
          parsedText: cleanedText,
        },
      });

      const nameValue = sanitizeDatabaseString(parsed.name ?? 'Talent');
      const focusValue = sanitizeDatabaseString(parsed.focus ?? '');
      const summaryValue = parsed.summary ? sanitizeDatabaseString(parsed.summary) : null;
      const skillsValue = (parsed.skills ?? []).map((s) => sanitizeDatabaseString(s));

      const profile = await this.prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name: nameValue,
          focus: focusValue,
          summary: summaryValue,
          skills: skillsValue,
        },
        update: {
          name: nameValue,
          focus: focusValue,
          summary: summaryValue,
          skills: skillsValue,
        },
      });

      return {
        resume: { id: resume.id, fileName: resume.fileName, fileUrl: resume.fileUrl, mimeType: resume.mimeType, fileSize: resume.fileSize },
        profile: {
          id: profile.id,
          name: profile.name,
          focus: profile.focus,
          summary: profile.summary,
          skills: profile.skills,
        },
      };
    } catch (err) {
      this.logger.error('Database create failed after storage upload — attempting cleanup', err);
      try {
        await this.storage.remove(storageKey);
      } catch {
        this.logger.warn(`Failed to cleanup storage after DB failure: ${storageKey}`);
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to process resume. Please try again.');
    }
  }

  async replaceResume(user: AuthUser, resumeId: string, file: UploadedFile): Promise<{
    resume: { id: string; fileName: string; fileUrl: string; mimeType: string | null; fileSize: number | null };
    profile: { id: string; name: string; focus: string; summary: string | null; skills: string[] };
  }> {
    const existing = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!existing || existing.userId !== user.id) {
      throw new NotFoundException('Resume not found');
    }

    const validation = this.fileValidator.validate(file);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(' '));
    }

    const safeFileName = sanitizeDatabaseString(validation.sanitizedFilename);
    const safeStorageKey = sanitizeFilename(validation.sanitizedFilename);
    const storageKey = `resumes/${user.id}/${Date.now()}-${safeStorageKey}`;

    let fileUrl: string;
    try {
      fileUrl = await this.storage.upload(file, storageKey);
    } catch (err) {
      this.logger.error('Storage upload failed', err);
      throw new BadRequestException('Failed to upload resume. Please try again.');
    }

    try {
      let rawText: string;
      try {
        rawText = await extractTextFromFile(file);
      } catch (err) {
        this.logger.error('Text extraction failed', err);
        await this.storage.remove(storageKey);
        throw new BadRequestException('Could not extract text from the file. It may be corrupted or password-protected.');
      }

      const cleanedText = sanitizeDatabaseString(rawText.slice(0, 50_000));
      if (!cleanedText || cleanedText.trim().length < 20) {
        await this.storage.remove(storageKey);
        throw new BadRequestException(
          'The file appears to contain insufficient text. Please upload a resume with at least a few lines of readable content.',
        );
      }

      const parsed = parseResumeText(cleanedText);

      const resume = await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          fileName: safeFileName,
          fileUrl,
          mimeType: sanitizeDatabaseString(validation.detectedMime),
          fileSize: file.size,
          parsedText: cleanedText,
        },
      });

      const nameValue = sanitizeDatabaseString(parsed.name ?? 'Talent');
      const focusValue = sanitizeDatabaseString(parsed.focus ?? '');
      const summaryValue = parsed.summary ? sanitizeDatabaseString(parsed.summary) : null;
      const skillsValue = (parsed.skills ?? []).map((s) => sanitizeDatabaseString(s));

      const profile = await this.prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name: nameValue,
          focus: focusValue,
          summary: summaryValue,
          skills: skillsValue,
        },
        update: {
          name: nameValue,
          focus: focusValue,
          summary: summaryValue,
          skills: skillsValue,
        },
      });

      try {
        await this.storage.remove(existing.fileUrl);
      } catch {
        this.logger.warn(`Failed to remove old resume file: ${existing.fileUrl}`);
      }

      return {
        resume: { id: resume.id, fileName: resume.fileName, fileUrl: resume.fileUrl, mimeType: resume.mimeType, fileSize: resume.fileSize },
        profile: {
          id: profile.id,
          name: profile.name,
          focus: profile.focus,
          summary: profile.summary,
          skills: profile.skills,
        },
      };
    } catch (err) {
      this.logger.error('Database update failed after storage upload — attempting cleanup', err);
      try {
        await this.storage.remove(storageKey);
      } catch {
        this.logger.warn(`Failed to cleanup storage after DB failure: ${storageKey}`);
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to process resume. Please try again.');
    }
  }

  async listMyResumes(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; fileName: string; fileUrl: string; mimeType: string | null; fileSize: number | null; createdAt: Date }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { userId: user.id };
    const [resumes, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, fileName: true, fileUrl: true, mimeType: true, fileSize: true, createdAt: true },
      }),
      this.prisma.resume.count({ where }),
    ]);
    return applyPagination(resumes, total, page, limit);
  }

  async getResume(user: AuthUser, resumeId: string): Promise<{ id: string; fileName: string; fileUrl: string; mimeType: string; fileSize: number; parsedText: string | null; createdAt: Date }> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      throw new NotFoundException('Resume not found');
    }
    return {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      mimeType: resume.mimeType ?? 'application/octet-stream',
      fileSize: resume.fileSize ?? 0,
      parsedText: resume.parsedText,
      createdAt: resume.createdAt,
    };
  }

  async getResumeFile(user: AuthUser, resumeId: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      throw new NotFoundException('Resume not found');
    }

    const buffer = await this.storage.get(resume.fileUrl);
    if (!buffer) {
      throw new NotFoundException('Resume file not found in storage');
    }

    return {
      buffer,
      fileName: resume.fileName,
      mimeType: resume.mimeType ?? 'application/octet-stream',
    };
  }

  async deleteResume(user: AuthUser, resumeId: string): Promise<void> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      throw new NotFoundException('Resume not found');
    }
    await this.prisma.resume.delete({ where: { id: resumeId } });
    try {
      await this.storage.remove(resume.fileUrl);
    } catch {
      this.logger.warn(`Failed to delete resume file from storage: ${resume.fileUrl}`);
    }
  }
}
