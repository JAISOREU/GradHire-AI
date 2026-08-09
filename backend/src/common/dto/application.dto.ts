import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  jobId!: string;

  @ApiProperty({ required: false, example: 'I am interested in this position...' })
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiProperty({ required: false, example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsOptional()
  @IsString()
  resumeId?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus, { message: 'Invalid application status' })
  status!: ApplicationStatus;

  @ApiProperty({ required: false, example: 'Moved to interview stage' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class ApplyDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId!: string;
}
