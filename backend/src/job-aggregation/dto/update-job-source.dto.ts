export class UpdateJobSourceDto {
  name?: string;
  baseUrl?: string;
  sourceType?: string;
  enabled?: boolean;
  crawlFrequency?: string;
  configuration?: Record<string, unknown>;
  status?: string;
}
