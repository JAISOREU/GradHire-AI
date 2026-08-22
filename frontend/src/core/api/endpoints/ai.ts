import { api } from '../client';

export type ResumeAnalysis = {
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
};

export type JobMatchResult = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  educationMatch: string;
  strengths: string[];
  weaknesses: string[];
  explanation: string;
  recommendations: string[];
};

export type CoverLetterResult = {
  coverLetter: string;
  keyPoints: string[];
  tone: string;
};

export type InterviewQuestionsResult = {
  questions: Array<{
    question: string;
    type: 'technical' | 'behavioral' | 'situational' | 'experience';
    difficulty: 'easy' | 'medium' | 'hard';
    expectedAnswer?: string;
  }>;
  totalQuestions: number;
  categories: string[];
};

export type JobDescriptionResult = {
  title: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  skills: string[];
  benefits: string[];
  employmentType: string;
  experienceLevel: string;
};

export type CandidateSummaryResult = {
  summary: string;
  keyStrengths: string[];
  potentialConcerns: string[];
  recommendation: string;
  fitScore: number;
};

export type CareerRecommendationResult = {
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
};

export const aiApi = {
  health: () => api<{ status: string; provider: string; ready: boolean }>('/api/v1/ai/health', { requiresAuth: false }),

  parseResume: (resumeText: string) =>
    api<any>('/api/v1/ai/resume/parse', { method: 'POST', json: { resumeText } }),

  analyzeResume: (resumeText: string, jobDescription?: string) =>
    api<ResumeAnalysis>('/api/v1/ai/resume/analyze', { method: 'POST', json: { resumeText, jobDescription } }),

  improveResume: (resumeText: string, targetRole?: string) =>
    api<{ improvedResume: string }>('/api/v1/ai/resume/improve', { method: 'POST', json: { resumeText, targetRole } }),

  extractSkills: (resumeText: string) =>
    api<{ skills: string[]; categories: Record<string, string[]> }>('/api/v1/ai/resume/skills', { method: 'POST', json: { resumeText } }),

  analyzeJob: (jobDescription: string, jobTitle: string) =>
    api<any>('/api/v1/ai/jobs/analyze', { method: 'POST', json: { jobDescription, jobTitle } }),

  matchJob: (resumeText: string, jobDescription: string) =>
    api<JobMatchResult>('/api/v1/ai/jobs/match', { method: 'POST', json: { resumeText, jobDescription } }),

  matchJobById: (jobId: string) =>
    api<JobMatchResult>(`/api/v1/ai/jobs/match/${jobId}`, { method: 'POST' }),

  generateCoverLetter: (resumeText: string, jobDescription: string, jobTitle: string, company: string) =>
    api<CoverLetterResult>('/api/v1/ai/cover-letter', { method: 'POST', json: { resumeText, jobDescription, jobTitle, company } }),

  generateJobDescription: (payload: { title: string; skills: string[]; responsibilities: string[]; experience?: string; education?: string; employmentType?: string }) =>
    api<JobDescriptionResult>('/api/v1/ai/job-description', { method: 'POST', json: payload }),

  generateInterviewQuestions: (jobDescription: string, candidateSkills?: string[], candidateExperience?: string, questionCount = 10) =>
    api<InterviewQuestionsResult>('/api/v1/ai/interview/questions', { method: 'POST', json: { jobDescription, candidateSkills, candidateExperience, questionCount } }),

  generateCandidateSummary: (candidateId: string) =>
    api<CandidateSummaryResult>('/api/v1/ai/candidates/summary', { method: 'POST', json: { candidateId } }),

  generateCareerRecommendations: (resumeText?: string, skills?: string[], interests?: string[]) =>
    api<CareerRecommendationResult>('/api/v1/ai/career/recommendations', { method: 'POST', json: { resumeText, skills, interests } }),

  careerChat: (message: string, conversationHistory?: Array<{ role: string; content: string }>) =>
    api<{ response: string; timestamp: string }>('/api/v1/ai/career/chat', { method: 'POST', json: { message, conversationHistory } }),

  skillGapAnalysis: (targetRole: string, currentSkills: string[]) =>
    api<any>('/api/v1/ai/skills/gap-analysis', { method: 'POST', json: { targetRole, currentSkills } }),
};
