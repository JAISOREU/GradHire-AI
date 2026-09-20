import { IsArray, IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  PayFrequency,
  RemoteScope,
  SalaryType,
  WorkplaceType,
} from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ required: false, example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false, enum: JobType })
  @IsOptional()
  @IsEnum(JobType, { message: 'Invalid job type' })
  type?: JobType;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel, { message: 'Invalid experience level' })
  experienceLevel!: ExperienceLevel;

  @ApiProperty({ required: false, type: Number, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Positions must be at least 1' })
  positions?: number;

  @ApiProperty({ example: 'Build scalable web applications' })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description!: string;

  @ApiProperty({ example: 'Develop and maintain backend services' })
  @IsString()
  responsibilities!: string;

  @ApiProperty({ example: 'Bachelor degree in Computer Science' })
  @IsString()
  requiredQualifications!: string;

  @ApiProperty({ required: false, example: 'Master degree preferred' })
  @IsOptional()
  @IsString()
  preferredQualifications?: string;

  @ApiProperty({ type: [String], example: ['TypeScript', 'Node.js'] })
  @IsArray()
  @IsString({ each: true })
  requiredSkills!: string[];

  @ApiProperty({ required: false, type: [String], example: ['TypeScript', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSkills?: string[];

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  location?: Record<string, unknown>;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  skills?: Array<{ name: string; required?: boolean }>;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  requirements?: Array<{ type: string; description: string }>;

  @ApiProperty({ enum: WorkplaceType })
  @IsEnum(WorkplaceType, { message: 'Invalid workplace type' })
  workplaceType!: WorkplaceType;

  @ApiProperty({ required: false, enum: RemoteScope })
  @IsOptional()
  @IsEnum(RemoteScope, { message: 'Invalid remote scope' })
  remoteScope?: RemoteScope;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteCountries?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteRegions?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteCities?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredTimezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezoneOverlap?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expectedOfficeAttendance?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workScheduleType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workingDays?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  flexibleHours?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredOverlapHours?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  nightShift?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  weekendWork?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  onCallRequired?: boolean;

  @ApiProperty({ required: false, enum: SalaryType })
  @IsOptional()
  @IsEnum(SalaryType, { message: 'Invalid salary type' })
  salaryType?: SalaryType;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  salaryMin?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  salaryMax?: number;

  @ApiProperty({ required: false, default: 'PHP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, enum: PayFrequency })
  @IsOptional()
  @IsEnum(PayFrequency, { message: 'Invalid pay frequency' })
  payFrequency?: PayFrequency;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  salaryUndisclosed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bonus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  commission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overtime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherCompensation?: string;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  acceptsFreshGraduates?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  acceptsStudents?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredGraduationYear?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  degreeRequired?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fieldOfStudyRequired?: string;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  noExperienceRequired?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  internshipAccepted?: boolean;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'applicationDeadline must be a valid ISO date string' })
  applicationDeadline?: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'hiringTargetDate must be a valid ISO date string' })
  hiringTargetDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  applicantCountVisible?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  autoCloseAfterDeadline?: boolean;

  @ApiProperty({ required: false, enum: JobStatus, default: JobStatus.DRAFT })
  @IsOptional()
  @IsEnum(JobStatus, { message: 'Invalid job status' })
  status?: JobStatus;
}

export class UpdateJobDto {
  @ApiProperty({ required: false, example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false, enum: JobType })
  @IsOptional()
  @IsEnum(JobType, { message: 'Invalid job type' })
  type?: JobType;

  @ApiProperty({ required: false, enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel, { message: 'Invalid experience level' })
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ required: false, type: Number, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Positions must be at least 1' })
  positions?: number;

  @ApiProperty({ required: false, example: 'Build scalable web applications' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'Develop and maintain backend services' })
  @IsOptional()
  @IsString()
  responsibilities?: string;

  @ApiProperty({ required: false, example: 'Bachelor degree in Computer Science' })
  @IsOptional()
  @IsString()
  requiredQualifications?: string;

  @ApiProperty({ required: false, example: 'Master degree preferred' })
  @IsOptional()
  @IsString()
  preferredQualifications?: string;

  @ApiProperty({ required: false, type: [String], example: ['TypeScript', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @ApiProperty({ required: false, type: [String], example: ['GraphQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSkills?: string[];

  @ApiProperty({ required: false, enum: WorkplaceType })
  @IsOptional()
  @IsEnum(WorkplaceType, { message: 'Invalid workplace type' })
  workplaceType?: WorkplaceType;

  @ApiProperty({ required: false, enum: RemoteScope })
  @IsOptional()
  @IsEnum(RemoteScope, { message: 'Invalid remote scope' })
  remoteScope?: RemoteScope;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteCountries?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteRegions?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  remoteCities?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredTimezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezoneOverlap?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expectedOfficeAttendance?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workScheduleType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workingDays?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  flexibleHours?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredOverlapHours?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  nightShift?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  weekendWork?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  onCallRequired?: boolean;

  @ApiProperty({ required: false, enum: SalaryType })
  @IsOptional()
  @IsEnum(SalaryType, { message: 'Invalid salary type' })
  salaryType?: SalaryType;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  salaryMin?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  salaryMax?: number;

  @ApiProperty({ required: false, default: 'PHP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, enum: PayFrequency })
  @IsOptional()
  @IsEnum(PayFrequency, { message: 'Invalid pay frequency' })
  payFrequency?: PayFrequency;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  negotiable?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  salaryUndisclosed?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bonus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  commission?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overtime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherCompensation?: string;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  acceptsFreshGraduates?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  acceptsStudents?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requiredGraduationYear?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  degreeRequired?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fieldOfStudyRequired?: string;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  noExperienceRequired?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  internshipAccepted?: boolean;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'applicationDeadline must be a valid ISO date string' })
  applicationDeadline?: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString({}, { message: 'hiringTargetDate must be a valid ISO date string' })
  hiringTargetDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  applicantCountVisible?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: true })
  @IsOptional()
  @IsBoolean()
  autoCloseAfterDeadline?: boolean;

  @ApiProperty({ required: false, enum: JobStatus, default: JobStatus.DRAFT })
  @IsOptional()
  @IsEnum(JobStatus, { message: 'Invalid job status' })
  status?: JobStatus;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  location?: Record<string, unknown>;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  skills?: Array<{ name: string; required?: boolean }>;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  requirements?: Array<{ type: string; description: string }>;
}

export class JobQueryDto {
  @ApiProperty({ required: false, type: Number, default: 1, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({ required: false, type: Number, default: 20, example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  @ApiProperty({ required: false, example: 'software engineer' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, enum: JobType })
  @IsOptional()
  @IsEnum(JobType, { message: 'Invalid job type' })
  type?: JobType;

  @ApiProperty({ required: false, enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel, { message: 'Invalid experience level' })
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ required: false, enum: WorkplaceType })
  @IsOptional()
  @IsEnum(WorkplaceType, { message: 'Invalid workplace type' })
  workplaceType?: WorkplaceType;

  @ApiProperty({ required: false, example: 'Philippines' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false, example: 'Metro Manila' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, type: Number, example: 20000 })
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({ required: false, type: Number, example: 50000 })
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  freshGraduateFriendly?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  internship?: boolean;

  @ApiProperty({ required: false, type: [String], example: ['React', 'Node.js'] })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false, enum: ['24h', '7d', '30d'], example: '7d' })
  @IsOptional()
  @IsIn(['24h', '7d', '30d'])
  datePosted?: '24h' | '7d' | '30d';

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be either asc or desc' })
  sortOrder?: 'asc' | 'desc';
}
