import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { SkillLevel } from '@prisma/client';

const validLevelIfPresent = (o: { level?: string | null }) =>
  o.level !== undefined && o.level !== null && o.level !== '';

export class CreateSkillDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @ValidateIf(validLevelIfPresent)
  @IsEnum(SkillLevel)
  level?: string;

  @IsOptional()
  yearsOfExperience?: number;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @ValidateIf(validLevelIfPresent)
  @IsEnum(SkillLevel)
  level?: string;

  @IsOptional()
  yearsOfExperience?: number;
}
