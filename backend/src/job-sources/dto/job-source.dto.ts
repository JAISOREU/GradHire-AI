import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobSourceType, JobSourceParserType, JobSourceAuthType } from '@prisma/client';

export class CreateJobSourceDto {
  @ApiProperty({ example: 'LinkedIn Jobs' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'LinkedIn' })
  @IsString()
  company!: string;

  @ApiProperty({ enum: JobSourceType })
  @IsEnum(JobSourceType, { message: 'Invalid source type' })
  sourceType!: JobSourceType;

  @ApiProperty({ enum: JobSourceParserType })
  @IsEnum(JobSourceParserType, { message: 'Invalid parser type' })
  parserType!: JobSourceParserType;

  @ApiProperty({ enum: JobSourceAuthType })
  @IsEnum(JobSourceAuthType, { message: 'Invalid auth type' })
  @IsOptional()
  authenticationType?: JobSourceAuthType;

  @ApiProperty({ example: 'https://www.linkedin.com' })
  @IsString()
  baseUrl!: string;

  @ApiProperty({ example: 'https://www.linkedin.com/jobs/feed/' })
  @IsString()
  feedUrl!: string;

  @ApiProperty({ required: false, type: Number, example: 60, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'crawlInterval must be at least 1 minute' })
  crawlInterval?: number;

  @ApiProperty({ required: false, type: Number, example: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'rateLimit must be at least 1' })
  rateLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attribution?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  config?: Record<string, unknown>;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  fieldMapping?: Record<string, string>;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  enabled?: boolean;
}

export class UpdateJobSourceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ required: false, enum: JobSourceType })
  @IsOptional()
  @IsEnum(JobSourceType, { message: 'Invalid source type' })
  sourceType?: JobSourceType;

  @ApiProperty({ required: false, enum: JobSourceParserType })
  @IsOptional()
  @IsEnum(JobSourceParserType, { message: 'Invalid parser type' })
  parserType?: JobSourceParserType;

  @ApiProperty({ required: false, enum: JobSourceAuthType })
  @IsOptional()
  @IsEnum(JobSourceAuthType, { message: 'Invalid auth type' })
  authenticationType?: JobSourceAuthType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  feedUrl?: string;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ required: false, type: Number, example: 60, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'crawlInterval must be at least 1 minute' })
  crawlInterval?: number;

  @ApiProperty({ required: false, type: Number, example: 10, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'rateLimit must be at least 1' })
  rateLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attribution?: string;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  config?: Record<string, unknown>;

  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  fieldMapping?: Record<string, string>;
}

export class TestJobSourceDto {}
