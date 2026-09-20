import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { EmploymentType, WorkAuthorizationStatus } from '@prisma/client';

const validIfPresent = (o: Record<string, unknown>, key: string) => {
  const value = o[key];
  return value !== undefined && value !== null && value !== '';
};

export class UpdateCareerPreferenceDto {
  @IsOptional()
  preferredJobTitles?: string[];

  @IsOptional()
  industries?: string[];

  @IsOptional()
  preferredLocations?: string[];

  @IsOptional()
  @ValidateIf((o) => validIfPresent(o, 'workArrangement'))
  @IsEnum(EmploymentType)
  workArrangement?: string;

  @IsOptional()
  @IsString()
  salaryExpectation?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @ValidateIf((o) => validIfPresent(o, 'workAuthorization'))
  @IsEnum(WorkAuthorizationStatus)
  workAuthorization?: string;

  @IsOptional()
  authorizedCountries?: string[];

  @IsOptional()
  needsVisaSponsorship?: boolean;
}
