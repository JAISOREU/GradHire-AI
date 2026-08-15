import { Injectable, Logger } from '@nestjs/common';

export interface QualityResult {
  pass: boolean;
  score: number;
  reasons: string[];
}

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);

  validate(raw: Record<string, unknown>, normalized: Record<string, unknown>): QualityResult {
    const reasons: string[] = [];
    let score = 1;

    const title = String(normalized.title ?? raw.title ?? '');
    if (!title || title.length < 3) {
      reasons.push('Title is missing or too short');
      score -= 0.3;
    }

    const description = String(normalized.description ?? raw.description ?? '');
    if (!description || description.length < 20) {
      reasons.push('Description is missing or too short');
      score -= 0.3;
    }

    const company = String(normalized.company ?? raw.company ?? '');
    if (!company) {
      reasons.push('Company is missing');
      score -= 0.2;
    }

    const applicationUrl = String(normalized.applicationUrl ?? raw.applicationUrl ?? '');
    if (!applicationUrl || applicationUrl === '#') {
      reasons.push('Application URL is missing');
      score -= 0.2;
    }

    const finalScore = Math.max(0, Math.min(1, score));
    const pass = reasons.length === 0;

    return { pass, score: finalScore, reasons };
  }
}
