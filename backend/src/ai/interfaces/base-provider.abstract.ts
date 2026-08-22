import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIChatRequest, AIChatResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIStructuredResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export abstract class BaseAIProvider implements AIProvider {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig, protected readonly providerName: string) {
    this.config = config;
  }

  abstract readonly supportedModels: string[];

  abstract generateText(request: AIRequest): Promise<AIResponse>;
  abstract generateStructured<T>(request: AIRequest, schema: Record<string, unknown>): Promise<AIStructuredResponse<T>>;
  abstract chat(request: AIChatRequest): Promise<AIChatResponse>;
  abstract embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse>;
  abstract countTokens(text: string): Promise<number>;
  abstract healthCheck(): Promise<boolean>;

  get name(): string {
    return this.providerName;
  }

  protected validateConfig(requiredFields: string[]): void {
    for (const field of requiredFields) {
      const value = this.config[field as keyof AIProviderConfig];
      if (!value) {
        throw new Error(`${this.providerName}: missing required config field '${field}'`);
      }
    }
  }

  protected buildSystemInstruction(systemInstruction?: string): string {
    return systemInstruction || 'You are a helpful assistant. Always respond with valid JSON when requested.';
  }
}
