import { IsOptional, IsString } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
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
  @IsString()
  level?: string;

  @IsOptional()
  yearsOfExperience?: number;
}
