import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import {
  ResumeParseResult,
  ResumeAnalysisResult,
  JobMatchResult,
  CoverLetterResult,
  InterviewQuestionsResult,
  JobDescriptionResult,
  CandidateSummaryResult,
  CareerRecommendationResult,
  SkillGapAnalysisResult,
  ChatContext,
} from './ai.types';
import { AuthGuard } from '../auth/auth.guard';
import { StudentGuard } from '../auth/student.guard';
import { EmployerGuard } from '../auth/employer.guard';
import { AuthUser } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
import { CacheService } from '../cache/cache.service';

const MAX_INPUT_LENGTH = 50000;
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /disregard\s+(all\s+)?previous/i,
  /new\s+instruction/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /act\s+as\s+if/i,
  /pretend\s+to\s+be/i,
  /bypass\s+(security|filter|restriction)/i,
  /override\s+(system|security|filter)/i,
];

function sanitizeInput(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new BadRequestException(`Input too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`);
  }
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new BadRequestException('Invalid input detected.');
    }
  }
  return trimmed;
}

function buildCacheKey(prefix: string, userId: string, ...args: (string | number)[]): string {
  return `ai:${prefix}:${userId}:${args.join(':')}`;
}

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService, private readonly prisma: PrismaService, private readonly cache: CacheService) {}

  @Get('health')
  async health() {
    const healthy = await this.ai.healthCheck();
    return { status: healthy ? 'ok' : 'degraded', provider: this.ai.getProviderName(), ready: this.ai.isReady() };
  }

  @Post('resume/parse')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async parseResume(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');
    return this.ai.parseResume(body.resumeText.slice(0, 50000));
  }

  @Post('resume/analyze')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async analyzeResume(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string; jobDescription?: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const resumeText = sanitizeInput(body.resumeText);
    const jobDescription = body.jobDescription ? sanitizeInput(body.jobDescription) : undefined;

    const cacheKey = buildCacheKey('resume-analyze', req.user.id, resumeText.length, jobDescription?.length || 0);
    const cached = await this.cache.get<ResumeAnalysisResult>(cacheKey);
    if (cached) return cached;

    const result = jobDescription
      ? await this.ai.generateStructured<ResumeAnalysisResult>(
          { prompt: `Analyze this resume and provide detailed feedback:\n\n${resumeText.slice(0, 50000)}\n\nAlso analyze against this job description:\n${jobDescription}`, systemInstruction: 'You are a professional resume analyst. Provide constructive, actionable feedback.' },
          {
            type: 'object',
            properties: {
              overallScore: { type: 'number', minimum: 0, maximum: 100 },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              missingSkills: { type: 'array', items: { type: 'string' } },
              suggestions: { type: 'array', items: { type: 'string' } },
              formattingIssues: { type: 'array', items: { type: 'string' } },
              experienceAnalysis: { type: 'string' },
              summary: { type: 'string' },
              skillGaps: { type: 'array', items: { type: 'string' } },
              improvementAreas: { type: 'array', items: { type: 'string' } },
            },
          }
        )
      : await this.ai.analyzeResume(resumeText);

    await this.cache.set(cacheKey, result, 3600);
    return result;
  }

  @Post('resume/improve')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async improveResume(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string; targetRole?: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const target = body.targetRole ? ` for a ${body.targetRole} role` : '';
    const result = await this.ai.generateText(
      `Improve and enhance this resume${target}. Make it more professional, impactful, and ATS-friendly. Keep the factual content but improve wording, structure, and impact statements.\n\n${body.resumeText.slice(0, 50000)}`,
      'You are a professional resume writer. Improve the resume while keeping all factual information accurate.',
    );

    return { improvedResume: result };
  }

  @Post('resume/skills')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async extractSkills(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    return this.ai.generateStructured<{ skills: string[]; categories: Record<string, string[]> }>(
      { prompt: `Extract all skills from this resume text. Categorize them into technical skills, soft skills, and tools/technologies:\n\n${body.resumeText.slice(0, 50000)}`, systemInstruction: 'You are a skills extraction engine. Extract only skills explicitly mentioned or clearly implied in the text.' },
      {
        type: 'object',
        properties: {
          skills: { type: 'array', items: { type: 'string' } },
          categories: { type: 'object' },
        },
      }
    );
  }

  @Post('jobs/analyze')
  @UseGuards(EmployerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async analyzeJob(@Req() req: Request & { user: AuthUser }, @Body() body: { jobDescription: string; jobTitle: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    return this.ai.generateStructured<{
      suggestions: string[];
      missingElements: string[];
      clarityScore: number;
      improvedDescription: string;
      suggestedSkills: string[];
      targetAudience: string;
    }>(
      { prompt: `Analyze this job description for clarity, completeness, and attractiveness:\n\nTitle: ${body.jobTitle}\nDescription: ${body.jobDescription}`, systemInstruction: 'You are a job description analyst. Provide constructive feedback.' },
      {
        type: 'object',
        properties: {
          suggestions: { type: 'array', items: { type: 'string' } },
          missingElements: { type: 'array', items: { type: 'string' } },
          clarityScore: { type: 'number', minimum: 0, maximum: 100 },
          improvedDescription: { type: 'string' },
          suggestedSkills: { type: 'array', items: { type: 'string' } },
          targetAudience: { type: 'string' },
        },
      }
    );
  }

  @Post('jobs/match')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async matchJob(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string; jobDescription: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const resumeText = sanitizeInput(body.resumeText);
    const jobDescription = sanitizeInput(body.jobDescription);

    const cacheKey = buildCacheKey('job-match', req.user.id, resumeText.length, jobDescription.length);
    const cached = await this.cache.get<JobMatchResult>(cacheKey);
    if (cached) return cached;

    const result = await this.ai.matchJob(resumeText, jobDescription);

    await this.cache.set(cacheKey, result, 1800);
    return result;
  }

  @Post('jobs/match/:jobId')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async matchJobById(@Req() req: Request & { user: AuthUser }, @Param('jobId') jobId: string) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, description: true, requiredSkills: true, preferredSkills: true },
    });

    if (!job) throw new Error('Job not found');

    const profile = await this.prisma.profile.findFirst({ where: { userId: req.user.id } });
    if (!profile) throw new Error('Profile not found');

    const resume = await this.prisma.resume.findFirst({ where: { userId: req.user.id, isPrimary: true } });
    const resumeText = resume?.parsedText || `${profile.summary || ''} Skills: ${profile.skills?.join(', ') || ''}`;

    return this.matchJob(req, {
      resumeText,
      jobDescription: `${job.title}\n\n${job.description}\n\nRequired Skills: ${job.requiredSkills?.join(', ') || ''}\nPreferred Skills: ${job.preferredSkills?.join(', ') || ''}`,
    });
  }

  @Post('cover-letter')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateCoverLetter(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText: string; jobDescription: string; jobTitle: string; company: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const resumeText = sanitizeInput(body.resumeText);
    const jobDescription = sanitizeInput(body.jobDescription);
    const jobTitle = sanitizeInput(body.jobTitle);
    const company = sanitizeInput(body.company);

    const cacheKey = buildCacheKey('cover-letter', req.user.id, jobTitle, company);
    const cached = await this.cache.get<CoverLetterResult>(cacheKey);
    if (cached) return cached;

    const coverLetter = await this.ai.generateText(
      `Write a professional cover letter for ${jobTitle} at ${company}.\n\nJob Description:\n${jobDescription.slice(0, 10000)}\n\nCandidate Background:\n${resumeText.slice(0, 30000)}`,
      'You are a professional cover letter writer. Write a compelling, personalized cover letter that highlights relevant experience and skills. Keep it concise (300-400 words) and professional.',
    );

    const response = { coverLetter } as CoverLetterResult;
    await this.cache.set(cacheKey, response, 3600);
    return response;
  }

  @Post('job-description')
  @UseGuards(EmployerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateJobDescription(@Req() req: Request & { user: AuthUser }, @Body() body: { title: string; skills: string[]; responsibilities: string[]; experience?: string; education?: string; employmentType?: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const description = await this.ai.generateText(
      `Generate a professional job description for:\n\nTitle: ${body.title}\nSkills: ${body.skills.join(', ')}\nResponsibilities: ${body.responsibilities.join(', ')}\nExperience: ${body.experience || 'Not specified'}\nEducation: ${body.education || 'Not specified'}\nEmployment Type: ${body.employmentType || 'Full-time'}`,
      'You are a professional HR writer. Generate a comprehensive, well-structured job description.',
    );

    return { description } as JobDescriptionResult;
  }

  @Post('interview/questions')
  @UseGuards(EmployerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateInterviewQuestions(@Req() req: Request & { user: AuthUser }, @Body() body: { jobDescription: string; candidateSkills?: string[]; candidateExperience?: string; questionCount?: number }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const jobDescription = sanitizeInput(body.jobDescription);
    const candidateSkills = body.candidateSkills?.map(s => sanitizeInput(s)) || [];
    const candidateExperience = body.candidateExperience ? sanitizeInput(body.candidateExperience) : undefined;
    const count = Math.min(body.questionCount || 10, 20);

    const cacheKey = buildCacheKey('interview-questions', req.user.id, jobDescription.length, count);
    const cached = await this.cache.get<InterviewQuestionsResult>(cacheKey);
    if (cached) return cached;

    const result = await this.ai.generateStructured<InterviewQuestionsResult>(
      { prompt: `Generate ${count} interview questions for this job and candidate profile.\n\nJob Description: ${jobDescription.slice(0, 10000)}\n\nCandidate Skills: ${candidateSkills.join(', ') || 'Not provided'}\nCandidate Experience: ${candidateExperience || 'Not provided'}`, systemInstruction: 'You are an expert interviewer. Generate diverse, relevant questions.' },
      {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                type: { type: 'string', enum: ['technical', 'behavioral', 'situational', 'experience'] },
                difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                expectedAnswer: { type: 'string' },
              },
            },
          },
          totalQuestions: { type: 'number' },
          categories: { type: 'array', items: { type: 'string' } },
        },
      }
    );

    await this.cache.set(cacheKey, result, 3600);
    return result;
  }

  @Post('candidates/summary')
  @UseGuards(EmployerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateCandidateSummary(@Req() req: Request & { user: AuthUser }, @Body() body: { candidateId: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const candidate = await this.prisma.user.findUnique({
      where: { id: body.candidateId },
      include: {
        profile: true,
        skills: true,
        educations: true,
        experiences: true,
        projects: true,
        certifications: true,
        applications: { where: { job: { employerId: req.user.id } }, include: { job: { select: { title: true, company: true } } } },
      },
    });

    if (!candidate) throw new Error('Candidate not found');

    const profileText = JSON.stringify({
      profile: candidate.profile,
      skills: candidate.skills,
      educations: candidate.educations,
      experiences: candidate.experiences,
      projects: candidate.projects,
      certifications: candidate.certifications,
      applications: candidate.applications,
    }, null, 2);

    return this.ai.generateStructured<CandidateSummaryResult>(
      { prompt: `Generate a candidate summary for an employer reviewing this candidate:\n\n${profileText}`, systemInstruction: 'You are a candidate evaluation assistant. Provide objective, fair assessments.' },
      {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          keyStrengths: { type: 'array', items: { type: 'string' } },
          potentialConcerns: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          fitScore: { type: 'number', minimum: 0, maximum: 100 },
        },
      }
    );
  }

  @Post('career/recommendations')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async generateCareerRecommendations(@Req() req: Request & { user: AuthUser }, @Body() body: { resumeText?: string; skills?: string[]; interests?: string[] }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const profile = await this.prisma.profile.findFirst({ where: { userId: req.user.id } });
    const skills = body.skills || profile?.skills || [];
    const interests = body.interests || [profile?.focus || ''].filter(Boolean);

    const profileSummary = {
      focus: profile?.focus,
      skills,
      education: profile?.education,
      experience: profile?.experience,
      interests,
    };

    return this.ai.generateCareerRecommendations(profileSummary);
  }

  @Post('career/chat')
  @UseGuards(AuthGuard)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async careerChat(@Req() req: Request & { user: AuthUser }, @Body() body: { message: string; conversationHistory?: Array<{ role: string; content: string }> }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const profile = await this.prisma.profile.findFirst({ where: { userId: req.user.id } });
    const context: ChatContext = {
      userId: req.user.id,
      userRole: req.user.role as 'STUDENT' | 'EMPLOYER' | 'ADMIN',
      profileSummary: profile ? {
        name: profile.name,
        focus: profile.focus,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
      } : undefined,
      recentMessages: (body.conversationHistory || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(),
      })),
    };

    const response = await this.ai.chat(context.recentMessages || [], context);
    return { response, timestamp: new Date().toISOString() };
  }

  @Post('skills/gap-analysis')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async skillGapAnalysis(@Req() req: Request & { user: AuthUser }, @Body() body: { targetRole: string; currentSkills: string[]; jobDescription?: string }) {
    if (!this.ai.isReady()) throw new Error('AI service not available');

    const result = await this.ai.generateSkillGapAnalysis(body.currentSkills, body.targetRole, body.jobDescription);

    return result;
  }

  @Get('recommendations')
  @UseGuards(StudentGuard)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  async getRecommendations(@Req() req: Request & { user: AuthUser }, @Query('top_k') topK?: string) {
    if (!this.ai.isReady()) {
      return { recommendations: [], provider: this.ai.getProviderName() };
    }

    const profile = await this.prisma.profile.findFirst({ where: { userId: req.user.id } });
    const focus = profile?.focus || 'general career';

    const recommendations = await this.ai.getPersonalizedRecommendations({
      focus,
      skills: profile?.skills || [],
      education: profile?.education,
      experience: profile?.experience,
      location: profile?.location,
      workAuthorization: profile?.workAuthorization,
    }, topK ? parseInt(topK, 10) : 5);

    return { recommendations, provider: this.ai.getProviderName() };
  }
}
