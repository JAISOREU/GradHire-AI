import { IsOptional, IsString } from 'class-validator';

export class UpdateCareerPreferenceDto {
  @IsOptional()
  preferredJobTitles?: string[];

  @IsOptional()
  industries?: string[];

  @IsOptional()
  preferredLocations?: string[];

  @IsOptional()
  @IsString()
  workArrangement?: string;

  @IsOptional()
  @IsString()
  salaryExpectation?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  workAuthorization?: string;

  @IsOptional()
  authorizedCountries?: string[];

  @IsOptional()
  needsVisaSponsorship?: boolean;
}
