export interface ResumeParseResult {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  skills?: string[];
  education?: Array<{
    institution?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    currentlyStudying?: boolean;
    description?: string;
  }>;
  experience?: Array<{
    jobTitle?: string;
    company?: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
    skillsUsed?: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    skillsUsed?: string[];
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    issuedAt?: string;
    expiresAt?: string;
    credentialId?: string;
    url?: string;
  }>;
  languages?: string[];
  achievements?: string[];
  careerInterests?: string[];
  focusAreas?: string[];
}

export interface ResumeAnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
  formattingIssues: string[];
  experienceAnalysis: string;
  summary: string;
  skillGaps: string[];
  improvementAreas: string[];
}

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  educationMatch: string;
  strengths: string[];
  weaknesses: string[];
  explanation: string;
  recommendations: string[];
}

export interface CoverLetterResult {
  coverLetter: string;
  keyPoints: string[];
  tone: string;
}

export interface InterviewQuestionsResult {
  questions: Array<{
    question: string;
    type: 'technical' | 'behavioral' | 'situational' | 'experience';
    difficulty: 'easy' | 'medium' | 'hard';
    expectedAnswer?: string;
  }>;
  totalQuestions: number;
  categories: string[];
}

export interface JobDescriptionResult {
  title: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  benefits: string[];
  employmentType: string;
  experienceLevel: string;
}

export interface CandidateSummaryResult {
  summary: string;
  keyStrengths: string[];
  potentialConcerns: string[];
  recommendation: string;
  fitScore: number;
}

export interface CareerRecommendationResult {
  recommendedPaths: Array<{
    title: string;
    description: string;
    matchScore: number;
    requiredSkills: string[];
    growthPotential: string;
    salaryRange?: string;
  }>;
  skillDevelopmentPlan: string[];
  shortTermGoals: string[];
  longTermGoals: string[];
  industryTrends: string[];
}

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

export interface SkillGapAnalysisResult {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  missingSkills: string[];
  skillGaps: Array<{
    skill: string;
    importance: string;
    learningResources: string[];
  }>;
  readinessScore: number;
  actionPlan: string[];
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  userId: string;
  userRole: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  profileSummary?: Record<string, unknown>;
  recentMessages?: ChatMessage[];
}
