import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @MinLength(1)
  institution!: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyStudying?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  institution?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyStudying?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
