import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ava Chen' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiProperty({ example: 'Full-stack development and AI products' })
  @IsString()
  @MinLength(2, { message: 'Focus must be at least 2 characters' })
  @IsNotEmpty({ message: 'Focus is required' })
  focus!: string;

  @ApiProperty({ required: false, example: ' Passionate about building scalable systems.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ required: false, example: ['TypeScript', 'React', 'Node.js'] })
  @IsOptional()
  skills?: string[];

  @ApiProperty({ required: false, example: 'B.S. Computer Science, University of Technology' })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ required: false, example: 'Software Engineer at Acme Corp' })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ required: false, example: '+63 900 000 0000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: 'Manila, Philippines' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 'https://avachen.dev' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, example: 'https://linkedin.com/in/avachen' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ required: false, example: 'https://github.com/avachen' })
  @IsOptional()
  @IsString()
  github?: string;

  @ApiProperty({ required: false, example: 'https://avachen.dev/portfolio' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  expectedSalary?: number;

  @ApiProperty({ required: false, example: 'IMMEDIATE' })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiProperty({ required: false, example: 'CITIZEN' })
  @IsOptional()
  @IsString()
  workAuthorization?: string;

  @ApiProperty({ required: false, example: ['Philippines', 'Singapore'] })
  @IsOptional()
  authorizedCountries?: string[];

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  needsVisaSponsorship?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  studentFriendly?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  freshGraduate?: boolean;

  @ApiProperty({ required: false, example: 2025 })
  @IsOptional()
  graduationYear?: number;

  @ApiProperty({ required: false, example: 'Bachelor of Science' })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiProperty({ required: false, example: 'Computer Science' })
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  internshipAccepted?: boolean;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  profileCompleted?: boolean;
}

export class UpdateEmployerProfileDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName!: string;

  @ApiProperty({ required: false, example: 'Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ required: false, example: 'Manila, Philippines' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false, example: 'We build great products.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'https://acme.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false, example: '+63 900 000 0000' })
  @IsOptional()
  @IsString()
  phone?: string;
}
