import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AiRecommendation {
  id: string;
  title: string;
  type: string;
  score: number;
  description: string;
  company?: string;
  location?: string;
  workplaceType?: string;
  matchReasons?: string[];
  matchedSkills?: string[];
  matchedEducation?: string[];
  matchedExperience?: string[];
}

export interface RecommendationMetrics {
  precision_at_k: Record<string, number>;
  recall_at_k: Record<string, number>;
  avg_latency_ms: number;
  total_requests: number;
}

export interface NormalizedJobResponse {
  title: string;
  company: string;
  description: string;
  type: string;
  workplaceType: string;
  experienceLevel: string;
  requiredSkills: string[];
  preferredSkills: string[];
  country?: string;
  city?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  async getRecommendations(focus: string, topK = 5): Promise<AiRecommendation[]> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/recommendations`, { focus, top_k: topK }),
      );
      return response.data.recommendations ?? [];
    } catch (error) {
      this.logger.warn('AI service unavailable, falling back to heuristic recommendations');
      return [];
    }
  }

  async getPersonalizedRecommendations(profile: Record<string, unknown>, topK = 5): Promise<AiRecommendation[]> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/recommendations`, { profile, top_k: topK }),
      );
      return response.data.recommendations ?? [];
    } catch (error) {
      this.logger.warn('AI personalized recommendations failed', error);
      return [];
    }
  }

  async getHeuristicRecommendations(profile: Record<string, unknown>, topK = 5): Promise<AiRecommendation[]> {
    const focus = String(profile.focus ?? '');
    if (!focus) return [];
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/recommendations`, { focus, top_k: topK, fallback: true }),
      );
      return response.data.recommendations ?? [];
    } catch (error) {
      this.logger.warn('AI heuristic recommendations failed', error);
      return [];
    }
  }

  async getMetrics(): Promise<RecommendationMetrics | null> {
    try {
      const response = await firstValueFrom(this.http.get(`${this.baseUrl}/metrics`));
      return response.data;
    } catch {
      return null;
    }
  }

  async normalizeJob(prompt: string): Promise<NormalizedJobResponse | null> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/normalize-job`, { prompt }),
      );
      return response.data ?? null;
    } catch {
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.get(`${this.baseUrl}/health`));
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getLocalRecommendations(profile: Record<string, unknown>, topK = 5): Promise<AiRecommendation[]> {
    const focus = String(profile.focus ?? '');
    if (!focus) return [];

    const profileSkills = Array.isArray(profile.skills) ? profile.skills.map((s) => String(s).toLowerCase()) : [];
    const profileEducation = String(profile.education ?? '').toLowerCase();
    const profileExperience = String(profile.experience ?? '').toLowerCase();
    const profileFocus = focus.toLowerCase();

    try {
      const response = await firstValueFrom(
        this.http.post(`${this.baseUrl}/recommendations`, { focus, top_k: topK * 2 }),
      );
      const recommendations = (response.data.recommendations ?? []) as AiRecommendation[];
      return recommendations.slice(0, topK).map((rec) => {
        const recText = `${rec.title} ${rec.description ?? ''} ${rec.company ?? ''}`.toLowerCase();
        const reasons: string[] = [];
        const matchedSkills: string[] = [];
        const matchedEducation: string[] = [];
        const matchedExperience: string[] = [];

        for (const skill of profileSkills) {
          if (recText.includes(skill)) {
            matchedSkills.push(skill);
            reasons.push(`Skill match: ${skill}`);
          }
        }

        if (profileEducation && recText.includes(profileEducation.slice(0, 20))) {
          matchedEducation.push(profileEducation.slice(0, 50));
          reasons.push('Education background match');
        }

        if (profileExperience && recText.includes(profileExperience.slice(0, 20))) {
          matchedExperience.push(profileExperience.slice(0, 50));
          reasons.push('Experience background match');
        }

        if (profileFocus && recText.includes(profileFocus)) {
          reasons.push(`Matches your focus: ${profileFocus}`);
        }

        return {
          ...rec,
          matchReasons: reasons.slice(0, 3),
          matchedSkills: matchedSkills.slice(0, 5),
          matchedEducation: matchedEducation.slice(0, 2),
          matchedExperience: matchedExperience.slice(0, 2),
        };
      });
    } catch {
      return [];
    }
  }
}
