import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewType } from '@prisma/client';

export class ScheduleInterviewDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'Application ID is required' })
  applicationId!: string;

  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType, { message: 'Invalid interview type' })
  type!: InterviewType;

  @ApiProperty({ example: '2025-08-15T10:00:00.000Z' })
  @IsString()
  @IsNotEmpty({ message: 'Scheduled at is required' })
  scheduledAt!: string;

  @ApiProperty({ required: false, type: Number, default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Duration must be at least 1 minute' })
  durationMinutes?: number;

  @ApiProperty({ required: false, example: 'Asia/Manila' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, example: '123 Main St, Manila' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 'https://meet.example.com/xyz' })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({ type: [String], example: ['John Doe', 'Jane Smith'] })
  @IsArray()
  @IsString({ each: true })
  interviewers!: string[];

  @ApiProperty({ required: false, example: 'Please bring portfolio' })
  @IsOptional()
  @IsString()
  notes?: string;
}
