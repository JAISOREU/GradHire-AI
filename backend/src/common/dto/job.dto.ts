import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: 'Company is required' })
  company!: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location!: string;

  @IsOptional()
  @IsEnum(JobType, { message: 'Type must be HIRING or INTERNSHIP' })
  type?: JobType;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
