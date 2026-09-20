import { Injectable, Logger, OnModuleInit, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { AIProvider, AIRequest, AIChatRequest, AIEmbeddingRequest } from './interfaces/ai-provider.interface';
import { AIProviderFactory, ProviderFactoryConfig, ProviderType } from './utils/provider.factory';
import { RESUME_PARSE_PROMPT, RESUME_ANALYSIS_PROMPT, JOB_MATCHING_PROMPT, CAREER_CHAT_PROMPT, SKILL_GAP_ANALYSIS_PROMPT } from './prompts/ai.prompts';
import {
  ResumeParseResult,
  ResumeAnalysisResult,
  JobMatchResult,
  CareerRecommendationResult,
  ChatMessage,
  ChatContext,
  AiRecommendation,
  NormalizedJobResponse,
  SkillGapAnalysisResult,
} from './ai.types';

export interface AiServiceConfig {
  provider: ProviderType;
  fallbackProvider?: ProviderType;
  gemini?: { apiKey: string; model?: string; temperature?: number; maxTokens?: number };
  openai?: { apiKey: string; model?: string; temperature?: number; maxTokens?: number; baseUrl?: string };
  groq?: { apiKey: string; model?: string; temperature?: number; maxTokens?: number };
  ollama?: { baseUrl?: string; model?: string; temperature?: number; maxTokens?: number };
}

@Injectable()
export class AiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiService.name);
  private provider: AIProvider | null = null;
  private fallbackProvider: AIProvider | null = null;
  private ready = false;
  private factory: AIProviderFactory;

  constructor() {
    this.factory = new AIProviderFactory();
  }

  async onModuleInit() {
    await this.initialize();
  }

  onModuleDestroy() {
    this.provider = null;
    this.fallbackProvider = null;
    this.ready = false;
  }

  async initialize(): Promise<void> {
    const providerType = (process.env.AI_PROVIDER || 'gemini') as ProviderType;
    const config = this.buildConfig(providerType);

    try {
      this.provider = this.factory.createProvider(config);
      this.logger.log(`AI provider initialized: ${this.provider.name}`);

      const fallbackType = process.env.AI_FALLBACK_PROVIDER as ProviderType | undefined;
      if (fallbackType && fallbackType !== providerType) {
        try {
          const fallbackConfig = this.buildConfig(fallbackType);
          this.fallbackProvider = this.factory.createProvider(fallbackConfig);
          this.logger.log(`AI fallback provider initialized: ${this.fallbackProvider.name}`);
        } catch (error) {
          this.logger.warn(`Failed to initialize fallback provider ${fallbackType}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      this.ready = true;
    } catch (error) {
      this.logger.error(`Failed to initialize AI provider ${providerType}:`, error);
      this.ready = false;
    }
  }

  private buildConfig(providerType: ProviderType): ProviderFactoryConfig {
    const baseConfig: ProviderFactoryConfig = { provider: providerType };

    switch (providerType) {
      case 'gemini':
        baseConfig.gemini = {
          apiKey: process.env.GEMINI_API_KEY || '',
          model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192', 10),
        };
        break;
      case 'openai':
        baseConfig.openai = {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '8192', 10),
          baseUrl: process.env.OPENAI_BASE_URL,
        };
        break;
      case 'groq':
        baseConfig.groq = {
          apiKey: process.env.GROQ_API_KEY || '',
          model: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
          temperature: parseFloat(process.env.GROQ_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '8192', 10),
        };
        break;
      case 'ollama':
        baseConfig.ollama = {
          baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'llama3.2',
          temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7'),
          maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '8192', 10),
        };
        break;
    }

    return baseConfig;
  }

  isReady(): boolean {
    return this.ready && this.provider !== null;
  }

  getProvider(): AIProvider {
    if (!this.provider) {
      throw new Error('AI provider not initialized');
    }
    return this.provider;
  }

  getProviderName(): string {
    return this.provider?.name || 'none';
  }

  async withFallback<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    try {
      return await operation(this.getProvider());
    } catch (error) {
      this.logger.warn(`Primary provider failed: ${error instanceof Error ? error.message : String(error)}`);

      if (this.fallbackProvider) {
        this.logger.log(`Attempting fallback with ${this.fallbackProvider.name}`);
        try {
          return await operation(this.fallbackProvider);
        } catch (fallbackError) {
          this.logger.error(`Fallback provider also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isReady()) {
      throw new ServiceUnavailableException('AI service not available');
    }

    return this.withFallback(async (provider) => {
      const response = await provider.generateText({ prompt, systemInstruction });
      return response.text;
    });
  }

  async generateStructured<T>(request: AIRequest, schema: Record<string, unknown>): Promise<T> {
    if (!this.isReady()) {
      throw new ServiceUnavailableException('AI service not available');
    }

    return this.withFallback(async (provider) => {
      const result = await provider.generateStructured<T>(request, schema);
      return result.data;
    });
  }

  async chat(messages: ChatMessage[], context?: ChatContext): Promise<string> {
    if (!this.isReady()) {
      throw new ServiceUnavailableException('AI service not available');
    }

    const aiMessages = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const systemInstruction = context ? this.buildChatSystemInstruction(context) : CAREER_CHAT_PROMPT;

    return this.withFallback(async (provider) => {
      const response = await provider.chat({ messages: aiMessages });
      return response.message.content;
    });
  }

  private buildChatSystemInstruction(context: ChatContext): string {
    const profileSummary = context.profileSummary ? JSON.stringify(context.profileSummary) : 'No profile information available';
    return `You are a career assistant for Gradture AI.

User Role: ${context.userRole}
Profile Summary: ${profileSummary}

${CAREER_CHAT_PROMPT}`;
  }

  async parseResume(resumeText: string): Promise<ResumeParseResult> {
    const schema = {
      type: 'object',
      properties: {
        personalInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            linkedin: { type: 'string' },
            github: { type: 'string' },
            portfolio: { type: 'string' },
          },
        },
        summary: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              institution: { type: 'string' },
              degree: { type: 'string' },
              fieldOfStudy: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              currentlyStudying: { type: 'boolean' },
              description: { type: 'string' },
            },
          },
        },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jobTitle: { type: 'string' },
              company: { type: 'string' },
              employmentType: { type: 'string' },
              location: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              currentlyWorking: { type: 'boolean' },
              description: { type: 'string' },
              skillsUsed: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              url: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              skillsUsed: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        certifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              issuer: { type: 'string' },
              issuedAt: { type: 'string' },
              expiresAt: { type: 'string' },
              credentialId: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        languages: { type: 'array', items: { type: 'string' } },
        achievements: { type: 'array', items: { type: 'string' } },
        careerInterests: { type: 'array', items: { type: 'string' } },
        focusAreas: { type: 'array', items: { type: 'string' } },
      },
    };

    return this.generateStructured<ResumeParseResult>(
      { prompt: `Parse this resume text and extract structured information:\n\n${resumeText.slice(0, 50000)}`, systemInstruction: RESUME_PARSE_PROMPT },
      schema
    );
  }

  async analyzeResume(resumeText: string): Promise<ResumeAnalysisResult> {
    const schema = {
      type: 'object',
      properties: {
        overallScore: { type: 'number' },
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
    };

    return this.generateStructured<ResumeAnalysisResult>(
      { prompt: `Analyze this resume:\n\n${resumeText.slice(0, 50000)}`, systemInstruction: RESUME_ANALYSIS_PROMPT },
      schema
    );
  }

  async matchJob(resumeText: string, jobDescription: string): Promise<JobMatchResult> {
    const schema = {
      type: 'object',
      properties: {
        matchScore: { type: 'number' },
        matchingSkills: { type: 'array', items: { type: 'string' } },
        missingSkills: { type: 'array', items: { type: 'string' } },
        experienceMatch: { type: 'string' },
        educationMatch: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        explanation: { type: 'string' },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    };

    return this.generateStructured<JobMatchResult>(
      {
        prompt: `Resume:\n${resumeText.slice(0, 30000)}\n\nJob Description:\n${jobDescription.slice(0, 30000)}`,
        systemInstruction: JOB_MATCHING_PROMPT,
      },
      schema
    );
  }

  async generateCareerRecommendations(profileSummary: Record<string, unknown>): Promise<CareerRecommendationResult> {
    const schema = {
      type: 'object',
      properties: {
        recommendedPaths: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              matchScore: { type: 'number' },
              requiredSkills: { type: 'array', items: { type: 'string' } },
              growthPotential: { type: 'string' },
              salaryRange: { type: 'string' },
            },
          },
        },
        skillDevelopmentPlan: { type: 'array', items: { type: 'string' } },
        shortTermGoals: { type: 'array', items: { type: 'string' } },
        longTermGoals: { type: 'array', items: { type: 'string' } },
        industryTrends: { type: 'array', items: { type: 'string' } },
      },
    };

    return this.generateStructured<CareerRecommendationResult>(
      { prompt: `Profile: ${JSON.stringify(profileSummary)}`, systemInstruction: 'You are a career advisor.' },
      schema
    );
  }

  async generateSkillGapAnalysis(currentSkills: string[], targetRole: string, jobDescription?: string): Promise<ResumeAnalysisResult> {
    const schema = {
      type: 'object',
      properties: {
        overallScore: { type: 'number' },
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
    };

    const prompt = `Current skills: ${currentSkills.join(', ')}\nTarget role: ${targetRole}\n${jobDescription ? `Job description: ${jobDescription.slice(0, 10000)}` : ''}`;

    return this.generateStructured<ResumeAnalysisResult>(
      { prompt, systemInstruction: SKILL_GAP_ANALYSIS_PROMPT },
      schema
    );
  }

  async getRecommendations(focus: string, topK = 5): Promise<AiRecommendation[]> {
    if (!this.isReady()) {
      return [];
    }

    try {
      return await this.withFallback(async (provider) => {
        const prompt = `You are a career recommendation engine. Based on the user's focus area, suggest relevant job roles.
Focus: ${focus}

Return a JSON array of recommendations. Each recommendation must have:
- id: a unique identifier like "rec-1"
- title: the job title
- type: the job type (HIRING, INTERNSHIP, etc.)
- score: a number between 0 and 1 indicating relevance
- description: a brief description of why this role fits
- company: a realistic company name
- location: a realistic location
- workplaceType: REMOTE, HYBRID, or ONSITE
- matchReasons: array of 2-3 brief match reasons
- matchedSkills: array of relevant skills
- matchedEducation: array of relevant education backgrounds
- matchedExperience: array of relevant experience types

Return exactly ${topK} recommendations as a JSON array.`;

        const schema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              score: { type: 'number' },
              description: { type: 'string' },
              company: { type: 'string' },
              location: { type: 'string' },
              workplaceType: { type: 'string' },
              matchReasons: { type: 'array', items: { type: 'string' } },
              matchedSkills: { type: 'array', items: { type: 'string' } },
              matchedEducation: { type: 'array', items: { type: 'string' } },
              matchedExperience: { type: 'array', items: { type: 'string' } },
            },
          },
        };

        const result = await provider.generateStructured<AiRecommendation[]>({ prompt, systemInstruction: 'You are a career recommendation engine. Always respond with valid JSON only.' }, schema);
        return result.data.slice(0, topK);
      });
    } catch (error) {
      this.logger.warn(`Failed to generate recommendations: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  async getPersonalizedRecommendations(profile: Record<string, unknown>, topK = 5): Promise<AiRecommendation[]> {
    if (!this.isReady()) {
      return [];
    }

    try {
      return await this.withFallback(async (provider) => {
        const focus = String(profile.focus || profile.summary || 'general career');
        const skills = Array.isArray(profile.skills) ? profile.skills.join(', ') : '';
        const education = profile.education ? JSON.stringify(profile.education) : '';
        const experience = profile.experience ? JSON.stringify(profile.experience) : '';

        const prompt = `You are a personalized career recommendation engine. Based on the candidate profile, suggest highly relevant job roles.
Profile:
- Focus: ${focus}
- Skills: ${skills || 'Not specified'}
- Education: ${education || 'Not specified'}
- Experience: ${experience || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Work Authorization: ${profile.workAuthorization || 'Not specified'}

Return a JSON array of exactly ${topK} personalized recommendations.`;

        const schema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              type: { type: 'string' },
              score: { type: 'number' },
              description: { type: 'string' },
              company: { type: 'string' },
              location: { type: 'string' },
              workplaceType: { type: 'string' },
              matchReasons: { type: 'array', items: { type: 'string' } },
              matchedSkills: { type: 'array', items: { type: 'string' } },
              matchedEducation: { type: 'array', items: { type: 'string' } },
              matchedExperience: { type: 'array', items: { type: 'string' } },
            },
          },
        };

        const result = await provider.generateStructured<AiRecommendation[]>({ prompt, systemInstruction: 'You are a personalized career recommendation engine. Always respond with valid JSON only.' }, schema);
        return result.data.slice(0, topK);
      });
    } catch (error) {
      this.logger.warn(`Failed to generate personalized recommendations: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  async normalizeJob(prompt: string): Promise<NormalizedJobResponse | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          workplaceType: { type: 'string' },
          experienceLevel: { type: 'string' },
          requiredSkills: { type: 'array', items: { type: 'string' } },
          preferredSkills: { type: 'array', items: { type: 'string' } },
          country: { type: 'string' },
          city: { type: 'string' },
          salaryMin: { type: 'number' },
          salaryMax: { type: 'number' },
          currency: { type: 'string' },
        },
      };

      return await this.generateStructured<NormalizedJobResponse>(
        { prompt, systemInstruction: 'You are a job data normalizer. Extract and normalize job information from raw data.' },
        schema
      );
    } catch {
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isReady() || !this.provider) {
      return false;
    }

    const primaryOk = await this.provider.healthCheck().catch(() => false);
    if (primaryOk) return true;

    if (this.fallbackProvider) {
      return await this.fallbackProvider.healthCheck().catch(() => false);
    }
    return false;
  }

  async countTokens(text: string): Promise<number> {
    if (!this.isReady() || !this.provider) {
      return Math.ceil(text.length / 4);
    }

    try {
      return await this.provider.countTokens(text);
    } catch {
      return Math.ceil(text.length / 4);
    }
  }
}

export { AiService as GeminiAiService };
