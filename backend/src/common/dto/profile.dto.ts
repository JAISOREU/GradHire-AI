import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString()
  @MinLength(2, { message: 'Focus must be at least 2 characters' })
  @IsNotEmpty({ message: 'Focus is required' })
  focus!: string;
}
