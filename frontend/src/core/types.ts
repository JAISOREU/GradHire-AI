export type UserRole = 'STUDENT' | 'EMPLOYER' | 'ADMIN';

export type JobType = 'HIRING' | 'INTERNSHIP';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  matchScore: number;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt?: string;
};

export type RecommendationResponse = {
  recommendations: string[];
};

export type AiRecommendation = {
  id: string;
  title: string;
  type: string;
  score: number;
  description: string;
};

export type AiRecommendationResponse = {
  recommendations: AiRecommendation[];
};

export type StudentProfile = {
  id: string;
  name: string;
  focus: string;
  summary?: string;
  skills?: string[];
};

export type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export type ApplicationJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
};

export type Application = {
  id: string;
  status: string;
  createdAt: string;
  job?: ApplicationJob;
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  job?: { id: string; title: string; company: string } | null;
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

/** Session payload returned by GET /auth/me */
export type SessionResponse = {
  user: AuthUser;
};

export type Resume = {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
};

export type ResumeParseResult = {
  resume: Resume;
  profile: StudentProfile;
};

export type JobStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export type EmployerJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  status: string;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt: string;
};

/* ---- Placeholder domain types for features whose backend is not yet built ---- */

export type Message = {
  id: string;
  from: string;
  to: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type SavedJob = {
  id: string;
  job: Job;
  savedAt: string;
};

export type Interview = {
  id: string;
  job: EmployerJob;
  candidate: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
};

export type AnalyticsSnapshot = {
  activeJobs: number;
  applicationsToday: number;
  views: number;
  pendingInterviews: number;
  hiringFunnel: number[];
};

export type StudentSettings = {
  emailNotifications: boolean;
  applicationAlerts: boolean;
  recommendationAlerts: boolean;
  messageAlerts: boolean;
  interviewAlerts: boolean;
  weeklyDigest: boolean;
  defaultFocus: string | null;
};

export type EmployerSettings = {
  applicationAlerts: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type Company = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
};
