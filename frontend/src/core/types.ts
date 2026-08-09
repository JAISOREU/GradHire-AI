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
  matchScore: number;
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
  profileCompleted?: boolean;
};

export type Profile = StudentProfile;

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

export type Interview = {
  id: string;
  job: EmployerJob;
  candidate: string;
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
  autoCloseAfterDeadline?: boolean;
  benefits?: JobBenefit[];
  requirements?: JobRequirement[];
  screeningQuestions?: ScreeningQuestion[];
  analytics?: JobAnalytics | null;
};
