import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AiRecommendation {
  id: string;
  title: string;
  type: string;
  score: number;
  description: string;
}

export interface RecommendationMetrics {
  precision_at_k: Record<string, number>;
  recall_at_k: Record<string, number>;
  avg_latency_ms: number;
  total_requests: number;
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

  async getMetrics(): Promise<RecommendationMetrics | null> {
    try {
      const response = await firstValueFrom(this.http.get(`${this.baseUrl}/metrics`));
      return response.data;
    } catch {
      return null;
    }
  }
}
