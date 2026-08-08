import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyDto {
  @IsString()
  @IsNotEmpty({ message: 'Job ID is required' })
  jobId!: string;
}
