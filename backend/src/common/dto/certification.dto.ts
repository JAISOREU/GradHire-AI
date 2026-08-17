import { IsOptional, IsString, IsISO8601 } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsISO8601()
  issuedAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

export class UpdateCertificationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsOptional()
  @IsISO8601()
  issuedAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  url?: string;
}
