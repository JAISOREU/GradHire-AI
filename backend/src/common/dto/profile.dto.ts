import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
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
