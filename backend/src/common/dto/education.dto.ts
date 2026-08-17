import { IsBoolean, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

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

  @IsISO8601()
  startDate!: string;

  @IsOptional()
  @IsISO8601()
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
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  currentlyStudying?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
