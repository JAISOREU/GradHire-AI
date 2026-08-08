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
