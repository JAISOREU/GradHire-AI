import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AiExtractionResult {
  title?: string;
  company?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  employmentType?: string;
  workplaceType?: string;
  location?: string;
  country?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryFrequency?: string;
  experienceLevel?: string;
  benefits?: string[];
  applicationDeadline?: string;
  industry?: string;
  confidence: Record<string, number>;
}

@Injectable()
export class AiExtractionService {
  private readonly logger = new Logger(AiExtractionService.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  async extractJobData(raw: {
    title?: string;
    company?: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    skills?: string[];
    employmentType?: string;
    workplaceType?: string;
    location?: string;
    country?: string;
    city?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    salaryFrequency?: string;
    experienceLevel?: string;
    benefits?: string[];
    applicationDeadline?: string;
    industry?: string;
  }): Promise<AiExtractionResult> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/extract-job`, {
          raw,
        }),
      );

      const data = response.data;
      return {
        title: data.title ?? raw.title,
        company: data.company ?? raw.company,
        description: data.description ?? raw.description,
        requirements: data.requirements ?? raw.requirements,
        responsibilities: data.responsibilities ?? raw.responsibilities,
        skills: data.skills ?? raw.skills,
        employmentType: data.employmentType ?? raw.employmentType,
        workplaceType: data.workplaceType ?? raw.workplaceType,
        location: data.location ?? raw.location,
        country: data.country ?? raw.country,
        city: data.city ?? raw.city,
        salaryMin: data.salaryMin ?? raw.salaryMin,
        salaryMax: data.salaryMax ?? raw.salaryMax,
        salaryCurrency: data.salaryCurrency ?? raw.salaryCurrency,
        salaryFrequency: data.salaryFrequency ?? raw.salaryFrequency,
        experienceLevel: data.experienceLevel ?? raw.experienceLevel,
        benefits: data.benefits ?? raw.benefits,
        applicationDeadline: data.applicationDeadline ?? raw.applicationDeadline,
        industry: data.industry ?? raw.industry,
        confidence: data.confidence ?? {},
      };
    } catch (error) {
      this.logger.warn('AI extraction failed, using raw data');
      return {
        ...raw,
        confidence: {},
      };
    }
  }
}
