import { Injectable, Logger } from '@nestjs/common';

export interface QualityResult {
  pass: boolean;
  score: number;
  reasons: string[];
}

const BOILERPLATE_PATTERNS = [
  /cookie\s*(policy|notice|consent)/i,
  /privacy\s*policy/i,
  /terms\s*(of\s*use|service)/i,
  /all\s*rights\s*reserved/i,
  /powered\s*by/i,
  /subscribe\s*to/i,
  /follow\s*us\s*(on|at)/i,
  /share\s*this\s*job/i,
  /back\s*to\s*(top|search)/i,
  /home\s*page\s*of/i,
  /site\s*map/i,
  /click\s*here\s*(to|for)/i,
  /read\s*more/i,
  /view\s*all\s*jobs/i,
  /browse\s*jobs/i,
  /sign\s*in\s*or\s*register/i,
  /login\s*(here|to|required)/i,
  /create\s*alert/i,
  /save\s*(this\s*)?job/i,
  /email\s*me\s*jobs/i,
  /similar\s*jobs/i,
  /related\s*jobs/i,
  /you\s*may\s*also\s*be\s*interested/i,
  /recommended\s*for\s*you/i,
  /sponsored\s*listing/i,
  /advertisement/i,
  /google\s*(ads|analytics|tag\s*manager)/i,
  /facebook\s*pixel/i,
  /linkedin\s*tracking/i,
  /utm_\w+=[^&\s]+/i,
];

const SPAM_PATTERNS = [
  /earn\s*\$\d+\s*(per|a)\s*(day|week|hour)/i,
  /make\s*money\s*fast/i,
  /work\s*from\s*home\s*easy\s*money/i,
  /no\s*experience\s*required\s*easy/i,
  /click\s*here\s*to\s*get\s*rich/i,
  /million\s*(dollars|bucks)\s*in/i,
  /free\s*money\s*no\s*catch/i,
];

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);
  private readonly minScore = 0.5;

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

    const boilerplateCount = BOILERPLATE_PATTERNS.filter((pattern) => pattern.test(description)).length;
    if (boilerplateCount > 0) {
      reasons.push(`Description contains ${boilerplateCount} boilerplate pattern(s)`);
      score -= 0.2;
    }

    const spamCount = SPAM_PATTERNS.filter((pattern) => pattern.test(description)).length;
    if (spamCount > 0) {
      reasons.push('Description contains spam patterns');
      score -= 0.5;
    }

    const company = String(normalized.company ?? raw.company ?? '');
    if (!company) {
      reasons.push('Company is missing');
      score -= 0.2;
    }

    const applicationUrl = String(normalized.applicationUrl ?? raw.applicationUrl ?? '');
    if (!applicationUrl || applicationUrl === '#') {
      reasons.push('Application URL is missing or invalid');
      score -= 0.2;
    }

    const sourceUrl = String(normalized.sourceUrl ?? raw.sourceUrl ?? '');
    if (!sourceUrl || sourceUrl === '#') {
      reasons.push('Source URL is missing or invalid');
      score -= 0.1;
    }

    const finalScore = Math.max(0, Math.min(1, score));
    const pass = finalScore >= this.minScore;

    return { pass, score: finalScore, reasons };
  }
}
