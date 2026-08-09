import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

export class CreateScreeningQuestionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId!: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType, { message: 'Invalid question type' })
  type!: QuestionType;

  @ApiProperty({ example: 'How many years of experience do you have?' })
  @IsString()
  @IsNotEmpty({ message: 'Question is required' })
  question!: string;

  @ApiProperty({ type: [String], example: ['Option A', 'Option B'] })
  @IsArray()
  @IsString({ each: true })
  options!: string[];

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ required: false, type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  knockout?: boolean;

  @ApiProperty({ required: false, type: Number, default: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}
