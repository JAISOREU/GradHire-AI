import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty({ message: 'Company is required' })
  company!: string;

  @ApiProperty({ example: 'Remote' })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location!: string;

  @ApiProperty({ required: false, enum: ['HIRING', 'INTERNSHIP'] })
  @IsOptional()
  @IsEnum(JobType, { message: 'Type must be HIRING or INTERNSHIP' })
  type?: JobType;

  @ApiProperty({ required: false, example: 'Build scalable web applications' })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;
}
