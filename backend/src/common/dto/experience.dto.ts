import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @MinLength(1)
  jobTitle!: string;

  @IsString()
  @MinLength(1)
  company!: string;

  @IsOptional()
  @IsString()
  employmentType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
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
  @IsString()
  employmentType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
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
