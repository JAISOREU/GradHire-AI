import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthUser } from '../auth/auth.service';
import { CreateScreeningQuestionDto } from '../common/dto/screening.dto';

@Injectable()
export class ScreeningService {
  private readonly logger = new Logger(ScreeningService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, body: CreateScreeningQuestionDto) {
    const job = await this.prisma.job.findUnique({ where: { id: body.jobId } });
    if (!job || job.employerId !== user.id) {
      throw new ForbiddenException('You can only add screening questions to your own jobs');
    }

    return this.prisma.screeningQuestion.create({
      data: {
        jobId: body.jobId,
        type: body.type,
        question: body.question,
        options: body.options ?? [],
        required: body.required ?? false,
        knockout: body.knockout ?? false,
        order: body.order ?? 0,
      },
    });
  }

  async getForJob(user: AuthUser, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== user.id) {
      throw new ForbiddenException('You can only view screening questions for your own jobs');
    }

    return this.prisma.screeningQuestion.findMany({
      where: { jobId },
      orderBy: { order: 'asc' },
    });
  }

  async update(user: AuthUser, questionId: string, body: Partial<CreateScreeningQuestionDto>) {
    const question = await this.prisma.screeningQuestion.findUnique({
      where: { id: questionId },
      include: { job: true },
    });
    if (!question || question.job.employerId !== user.id) {
      throw new ForbiddenException('You can only update screening questions for your own jobs');
    }

    return this.prisma.screeningQuestion.update({
      where: { id: questionId },
      data: {
        type: body.type,
        question: body.question,
        options: body.options,
        required: body.required,
        knockout: body.knockout,
        order: body.order,
      },
    });
  }

  async delete(user: AuthUser, questionId: string) {
    const question = await this.prisma.screeningQuestion.findUnique({
      where: { id: questionId },
      include: { job: true },
    });
    if (!question || question.job.employerId !== user.id) {
      throw new ForbiddenException('You can only delete screening questions for your own jobs');
    }

    await this.prisma.screeningQuestion.delete({ where: { id: questionId } });
    return { message: 'Screening question deleted' };
  }
}
