import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { parseResumeText, extractTextFromFile } from './resume.parser';
import type { UploadedFile } from './resume.types';
import { PaginationParams, PaginatedResponse, applyPagination } from '../common/pagination';
import { IStorageService } from '../storage/storage.service';
import { STORAGE_SERVICE } from '../storage/storage.module';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(private readonly prisma: PrismaService, @Inject(STORAGE_SERVICE) private readonly storage: IStorageService) {}

  /**
   * Upload a resume file, extract text, parse it, and auto-fill the student's profile.
   */
  async uploadAndParse(user: AuthUser, file: UploadedFile): Promise<{
    resume: { id: string; fileName: string; fileUrl: string };
    profile: { id: string; name: string; focus: string; summary: string | null; skills: string[] };
  }> {
    if (user.role !== 'STUDENT') {
      throw new BadRequestException('Only students can upload resumes');
    }

    // Validate file type
    const mime = file.mimetype?.toLowerCase() ?? '';
    const name = file.originalname?.toLowerCase() ?? '';
    const isPdf = mime === 'application/pdf' || name.endsWith('.pdf');
    const isDocx = mime.includes('word') || mime.includes('officedocument') || name.endsWith('.doc') || name.endsWith('.docx');
    const isTxt = mime === 'text/plain' || name.endsWith('.txt');
    const isImage = mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|bmp|webp|tiff?)$/.test(name);

    if (isImage) {
      throw new BadRequestException(
        'Image files are not supported. Please upload a PDF, DOCX, or TXT resume.',
      );
    }

    if (!isPdf && !isDocx && !isTxt) {
      throw new BadRequestException(
        'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the 5 MB limit.');
    }

    // Extract text
    let rawText: string;
    try {
      rawText = await extractTextFromFile(file);
    } catch (err) {
      this.logger.error('Text extraction failed', err);
      throw new BadRequestException('Could not extract text from the file. It may be corrupted or password-protected.');
    }

    if (!rawText || rawText.trim().length < 20) {
      throw new BadRequestException(
        'The file appears to contain insufficient text. Please upload a resume with at least a few lines of readable content.',
      );
    }

    // Parse resume into structured fields
    const parsed = parseResumeText(rawText);

    // Store the resume record
    const storageKey = `resumes/${user.id}/${Date.now()}-${file.originalname}`;
    const fileUrl = await this.storage.upload(file, storageKey);

    const resume = await this.prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.originalname,
        fileUrl,
        parsedText: rawText.slice(0, 50_000), // cap at 50 KB
      },
    });

    // Upsert the profile with parsed data
    const nameValue = parsed.name ?? 'Student';
    const focusValue = parsed.focus;
    const summaryValue = parsed.summary;
    const skillsValue = parsed.skills;

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
      resume: { id: resume.id, fileName: resume.fileName, fileUrl: resume.fileUrl },
      profile: {
        id: profile.id,
        name: profile.name,
        focus: profile.focus,
        summary: profile.summary,
        skills: profile.skills,
      },
    };
  }

  /** List resumes uploaded by the current user. */
  async listMyResumes(user: AuthUser, pagination?: PaginationParams): Promise<PaginatedResponse<{ id: string; fileName: string; fileUrl: string; createdAt: Date }>> {
    const { page = 1, limit = 20 } = pagination ?? {};
    const where = { userId: user.id };
    const [resumes, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, fileName: true, fileUrl: true, createdAt: true },
      }),
      this.prisma.resume.count({ where }),
    ]);
    return applyPagination(resumes, total, page, limit);
  }

  /** Get a single resume by ID (ownership enforced). */
  async getResume(user: AuthUser, resumeId: string): Promise<{ id: string; fileName: string; fileUrl: string; parsedText: string | null; createdAt: Date }> {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume || resume.userId !== user.id) {
      throw new NotFoundException('Resume not found');
    }
    return {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      parsedText: resume.parsedText,
      createdAt: resume.createdAt,
    };
  }
}

