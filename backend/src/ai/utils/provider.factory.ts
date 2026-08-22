import { Injectable, Logger } from '@nestjs/common';
import { AIProvider, AIProviderConfig } from '../interfaces/ai-provider.interface';
import { GeminiProvider, GeminiProviderConfig } from '../providers/gemini.provider';
import { OpenAIProvider, OpenAIProviderConfig } from '../providers/openai.provider';
import { GroqProvider, GroqProviderConfig } from '../providers/groq.provider';
import { OllamaProvider, OllamaProviderConfig } from '../providers/ollama.provider';

export type ProviderType = 'gemini' | 'openai' | 'groq' | 'ollama';

export interface ProviderFactoryConfig {
  provider: ProviderType;
  gemini?: GeminiProviderConfig;
  openai?: OpenAIProviderConfig;
  groq?: GroqProviderConfig;
  ollama?: OllamaProviderConfig;
}

@Injectable()
export class AIProviderFactory {
  private readonly logger = new Logger(AIProviderFactory.name);

  createProvider(config: ProviderFactoryConfig): AIProvider {
    const providerType = config.provider;

    this.logger.log(`Creating AI provider: ${providerType}`);

    switch (providerType) {
      case 'gemini':
        if (!config.gemini?.apiKey) {
          throw new Error('Gemini provider selected but GEMINI_API_KEY is not configured');
        }
        return new GeminiProvider(config.gemini);

      case 'openai':
        if (!config.openai?.apiKey) {
          throw new Error('OpenAI provider selected but OPENAI_API_KEY is not configured');
        }
        return new OpenAIProvider(config.openai);

      case 'groq':
        if (!config.groq?.apiKey) {
          throw new Error('Groq provider selected but GROQ_API_KEY is not configured');
        }
        return new GroqProvider(config.groq);

      case 'ollama':
        return new OllamaProvider(config.ollama || {});

      default:
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }
}
