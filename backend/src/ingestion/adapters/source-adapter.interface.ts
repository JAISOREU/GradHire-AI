export interface SourceAdapter {
  readonly sourceType: string;
  fetch(source: { feedUrl: string; config?: Record<string, unknown>; rateLimit?: number }): Promise<RawJobItem[]>;
}

export interface RawJobItem {
  externalId: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  type?: string;
  workplaceType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  skills?: string[];
  requiredQualifications?: string;
  acceptsFreshGraduates?: boolean;
  acceptsStudents?: boolean;
  noExperienceRequired?: boolean;
  internshipAccepted?: boolean;
  postedAt?: Date | string;
  expiresAt?: Date | string;
  applicationUrl: string;
  sourceUrl: string;
  raw: Record<string, unknown>;
}
