import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { EmploymentType } from '@prisma/client';

export class CreateExperienceDto {
  @IsString()
  @MinLength(1)
  jobTitle!: string;

  @IsString()
  @MinLength(1)
  company!: string;

  @IsOptional()
  @ValidateIf((o) => o.employmentType !== undefined && o.employmentType !== null && o.employmentType !== '')
  @IsEnum(EmploymentType)
  employmentType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsISO8601()
  startDate!: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyWorking?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  skillsUsed?: string[];
}

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  company?: string;

  @IsOptional()
  @ValidateIf((o) => o.employmentType !== undefined && o.employmentType !== null && o.employmentType !== '')
  @IsEnum(EmploymentType)
  employmentType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyWorking?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  skillsUsed?: string[];
}
