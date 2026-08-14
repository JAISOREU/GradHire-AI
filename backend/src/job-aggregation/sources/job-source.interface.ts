export interface RawJobPosting {
  title: string;
  company: string;
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
  educationRequirements?: string;
  benefits?: string[];
  applicationDeadline?: string;
  industry?: string;
  sourceUrl: string;
  originalPostingDate?: string;
}

export interface NormalizedJob extends RawJobPosting {
  normalizedTitle: string;
  normalizedCompany: string;
  normalizedLocation: string;
  normalizedEmploymentType?: string;
  normalizedWorkplaceType?: string;
  normalizedExperienceLevel?: string;
  confidence: Record<string, { value: string | null; confidence: number }>;
}

export interface JobSourceConnector {
  sourceType: string;
  discoverJobs(source: { id: string; baseUrl: string; configuration?: Record<string, unknown> }): Promise<RawJobPosting[]>;
  fetchJob(url: string): Promise<RawJobPosting>;
}
