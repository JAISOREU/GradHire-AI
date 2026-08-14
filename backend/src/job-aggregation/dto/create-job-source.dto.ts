export class CreateJobSourceDto {
  name!: string;
  baseUrl!: string;
  sourceType!: string;
  enabled?: boolean;
  crawlFrequency?: string;
  configuration?: Record<string, unknown>;
}
