export type UserRole = 'STUDENT' | 'EMPLOYER' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY' | 'OTHER';

export type JobType = 'HIRING' | 'INTERNSHIP' | 'APPRENTICESHIP' | 'CONTRACT' | 'TEMPORARY' | 'FREELANCE' | 'PART_TIME';

export type ExperienceLevel = 'NO_EXPERIENCE' | 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'MANAGER';

export type WorkplaceType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type RemoteScope = 'COUNTRY' | 'REGION' | 'MULTI_COUNTRY' | 'WORLDWIDE';

export type SalaryType = 'ANNUAL' | 'MONTHLY' | 'HOURLY' | 'DAILY' | 'PROJECT_BASED';

export type PayFrequency = 'MONTHLY' | 'BI_WEEKLY' | 'WEEKLY' | 'PER_PROJECT';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'CLOSED' | 'EXPIRED' | 'ARCHIVED';

export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'ASSESSMENT' | 'OFFER' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';

export type ApplicationSource = 'DIRECT' | 'REFERRAL' | 'AI_RECOMMENDATION' | 'EXTERNAL';

export type InterviewType = 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'HR' | 'FINAL';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type QuestionType = 'SHORT_TEXT' | 'LONG_TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'NUMBER' | 'DATE' | 'FILE_UPLOAD';

export type RequirementType = 'REQUIRED' | 'OPTIONAL' | 'KNOCKOUT';

export type WorkAuthorizationStatus = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'WORK_VISA' | 'STUDENT_VISA' | 'NEEDS_SPONSORSHIP' | 'NOT_AUTHORIZED';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  matchScore?: number;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt?: string;
  employerId?: string;
  companyId?: string;
  department?: string;
  experienceLevel?: ExperienceLevel;
  positions?: number;
  responsibilities?: string;
  requiredQualifications?: string;
  preferredQualifications?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  status?: JobStatus;
  featured?: boolean;
  applicationDeadline?: string;
  hiringTargetDate?: string;
  publishedAt?: string;
  views?: number;
  workplaceType?: WorkplaceType;
  remoteScope?: RemoteScope;
  remoteCountries?: string[];
  remoteRegions?: string[];
  remoteCities?: string[];
  requiredTimezone?: string;
  timezoneOverlap?: string;
  expectedOfficeAttendance?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  workScheduleType?: string;
  workingDays?: string;
  startTime?: string;
  endTime?: string;
  flexibleHours?: boolean;
  requiredOverlapHours?: string;
  nightShift?: boolean;
  weekendWork?: boolean;
  onCallRequired?: boolean;
  salaryType?: SalaryType;
  currency?: string;
  payFrequency?: PayFrequency;
  negotiable?: boolean;
  salaryUndisclosed?: boolean;
  bonus?: string;
  commission?: string;
  equity?: string;
  overtime?: string;
  otherCompensation?: string;
  acceptsFreshGraduates?: boolean;
  acceptsStudents?: boolean;
  requiredGraduationYear?: string;
  degreeRequired?: string;
  fieldOfStudyRequired?: string;
  noExperienceRequired?: boolean;
  internshipAccepted?: boolean;
  applicantCountVisible?: boolean;
  autoCloseAfterDeadline?: boolean;
  isExternal?: boolean;
  applicationUrl?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  sourceJobId?: string | null;
  importedAt?: string | null;
  companyRef?: { name?: string; industry?: string; logo?: string; description?: string } | null;
  benefits?: JobBenefit[];
  requirements?: JobRequirement[];
  screeningQuestions?: ScreeningQuestion[];
  analytics?: JobAnalytics | null;
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
  company?: string;
  location?: string;
  workplaceType?: string;
  matchReasons?: string[];
  matchedSkills?: string[];
  matchedEducation?: string[];
  matchedExperience?: string[];
};

export type AiRecommendationResponse = {
  recommendations: AiRecommendation[];
};

export type PersonalizedRecommendationsResponse = {
  ready: boolean;
  missing: string[];
  checks: { key: string; required: boolean; ready: boolean }[];
  recommendations: AiRecommendation[];
  profileSummary: Record<string, unknown>;
  fallback: boolean;
};

export type StudentProfile = {
  id: string;
  name: string;
  focus: string;
  summary?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  expectedSalary?: string;
  availability?: string;
  workAuthorization?: WorkAuthorizationStatus;
  authorizedCountries?: string[];
  needsVisaSponsorship?: boolean;
  studentFriendly?: boolean;
  freshGraduate?: boolean;
  graduationYear?: string;
  degree?: string;
  fieldOfStudy?: string;
  internshipAccepted?: boolean;
  visibility?: string;
  profileCompleted?: boolean;
};

export type Education = {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  currentlyStudying: boolean;
  description?: string;
};

export type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description?: string;
  skillsUsed: string[];
};

export type Skill = {
  id: string;
  name: string;
  category?: string;
  level?: string;
  yearsOfExperience?: number;
};

export type Certification = {
  id: string;
  name: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  credentialId?: string;
  url?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  skillsUsed: string[];
};

export type CareerPreference = {
  id: string;
  preferredJobTitles: string[];
  industries: string[];
  preferredLocations: string[];
  workArrangement?: string;
  salaryExpectation?: string;
  availability?: string;
  workAuthorization?: string;
  authorizedCountries: string[];
  needsVisaSponsorship: boolean;
};

export type ProfileCompleteness = {
  percentage: number;
  missing: string[];
  sections: { key: string; weight: number; filled: boolean }[];
};

export type AiReadiness = {
  ready: boolean;
  missing: string[];
  checks: { key: string; required: boolean; ready: boolean }[];
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

export type ApplicationStatusHistory = {
  id: string;
  applicationId: string;
  previousStatus?: ApplicationStatus;
  newStatus: ApplicationStatus;
  actorId?: string;
  actorRole?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ApplicationDocument = {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  createdAt: string;
};

export type ApplicationAnswer = {
  id: string;
  applicationId: string;
  questionId?: string;
  documentId?: string;
  value: string;
  createdAt: string;
};

export type ScreeningQuestion = {
  id: string;
  jobId: string;
  type: QuestionType;
  question: string;
  options: string[];
  required: boolean;
  knockout: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Application = {
  id: string;
  status: string;
  createdAt: string;
  job?: ApplicationJob;
  studentId?: string;
  student?: {
    id: string;
    email: string;
    profile?: {
      name?: string;
      skills?: string[];
    } | null;
  } | null;
  jobId?: string;
  source?: ApplicationSource;
  coverLetter?: string;
  resumeVersionId?: string;
  resumeSnapshot?: string;
  answersSnapshot?: unknown;
  documentsSnapshot?: unknown;
  submittedAt?: string;
  viewedAt?: string;
  lastStatusChangeAt?: string;
  withdrawnAt?: string;
  rejectedAt?: string;
  hiredAt?: string;
  statusHistory?: ApplicationStatusHistory[];
  events?: ApplicationEvent[];
  documents?: ApplicationDocument[];
  answers?: ApplicationAnswer[];
  interview?: Interview | null;
  lastEvent?: ApplicationStatusHistory | null;
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
  avatarUrl?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type SessionResponse = {
  user: AuthUser;
};

export type Resume = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  fileSize?: number | null;
  parsedText?: string | null;
  createdAt: string;
};

export type ResumeParseResult = {
  resume: Resume;
  profile: {
    id: string;
    name: string;
    focus: string;
    summary: string | null;
    skills: string[];
    phone?: string | null;
    location?: string | null;
    education?: string | null;
    experience?: string | null;
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
    expectedSalary?: string | null;
    availability?: string | null;
    graduationYear?: string | null;
    degree?: string | null;
    fieldOfStudy?: string | null;
  };
  parsed: {
    name: string | null;
    email: string | null;
    phone: string | null;
    skills: string[];
    focus: string;
    summary: string;
    address: string | null;
    education: string | null;
    experience: string | null;
    projects: string | null;
  };
};

export type Interview = {
  id: string;
  applicationId: string;
  application: {
    id: string;
    job: {
      id: string;
      title: string;
      company: string;
      location: string;
    };
    student: {
      id: string;
      profile?: {
        id: string;
        name: string;
        focus: string;
      } | null;
    };
  };
  scheduledAt: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  type?: InterviewType;
  durationMinutes?: number;
  endTime?: string;
  timezone?: string;
  location?: string;
  meetingLink?: string;
  interviewers?: string[];
  notes?: string;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type JobAnalytics = {
  id: string;
  jobId: string;
  totalApplicants: number;
  newApplicants: number;
  awaitingReview: number;
  shortlisted: number;
  interviewing: number;
  offers: number;
  hired: number;
  rejected: number;
  withdrawn: number;
  avgTimeToReview?: number;
  avgTimeToHire?: number;
  updatedAt: string;
};

export type JobBenefit = {
  id: string;
  jobId: string;
  name: string;
  custom: boolean;
  createdAt: string;
};

export type JobRequirement = {
  id: string;
  jobId: string;
  type: RequirementType;
  description: string;
  order: number;
  createdAt: string;
};

export type JobSkill = {
  id: string;
  jobId: string;
  name: string;
  required: boolean;
  createdAt: string;
};

export type JobLocation = {
  id: string;
  jobId: string;
  country: string;
  region?: string;
  city: string;
  postalCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  from: string;
  to: string;
  fromName?: string;
  toName?: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type SavedJob = {
  id: string;
  job: Job;
  savedAt: string;
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
  userId: string;
  emailNotifications: boolean;
  applicationAlerts: boolean;
  recommendationAlerts: boolean;
  messageAlerts: boolean;
  interviewAlerts: boolean;
  weeklyDigest: boolean;
  defaultFocus: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Company = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
  website?: string;
  size?: string;
  founded?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployerProfile = {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  website?: string;
  phone?: string;
  description?: string;
  logo?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  employerId?: string;
  companyId?: string;
  department?: string;
  experienceLevel?: ExperienceLevel;
  positions?: number;
  responsibilities?: string;
  requiredQualifications?: string;
  preferredQualifications?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  featured?: boolean;
  applicationDeadline?: string;
  hiringTargetDate?: string;
  publishedAt?: string;
  views?: number;
  workplaceType?: WorkplaceType;
  remoteScope?: RemoteScope;
  remoteCountries?: string[];
  remoteRegions?: string[];
  remoteCities?: string[];
  requiredTimezone?: string;
  timezoneOverlap?: string;
  expectedOfficeAttendance?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  workScheduleType?: string;
  workingDays?: string;
  startTime?: string;
  endTime?: string;
  flexibleHours?: boolean;
  requiredOverlapHours?: string;
  nightShift?: boolean;
  weekendWork?: boolean;
  onCallRequired?: boolean;
  salaryType?: SalaryType;
  currency?: string;
  payFrequency?: PayFrequency;
  negotiable?: boolean;
  salaryUndisclosed?: boolean;
  bonus?: string;
  commission?: string;
  equity?: string;
  overtime?: string;
  otherCompensation?: string;
  acceptsFreshGraduates?: boolean;
  acceptsStudents?: boolean;
  requiredGraduationYear?: string;
  degreeRequired?: string;
  fieldOfStudyRequired?: string;
  noExperienceRequired?: boolean;
  internshipAccepted?: boolean;
  applicantCountVisible?: boolean;
  applicantCount?: number;
  autoCloseAfterDeadline?: boolean;
  companyRef?: { name?: string; industry?: string; logo?: string; description?: string } | null;
  benefits?: JobBenefit[];
  requirements?: JobRequirement[];
  screeningQuestions?: ScreeningQuestion[];
  analytics?: JobAnalytics | null;
};

export type JobSourceType = 'API' | 'RSS' | 'JSON' | 'HTML';
export type JobSourceStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'RATE_LIMITED';
export type IngestionJobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
export type ImportedJobStatus = 'IMPORTED' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';

