import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { BaseAIProvider } from '../interfaces/base-provider.abstract';
import { AIProviderConfig, AIRequest, AIResponse, AIChatRequest, AIChatResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIStructuredResponse } from '../interfaces/ai-provider.interface';

export interface OpenAIProviderConfig extends AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

@Injectable()
export class OpenAIProvider extends BaseAIProvider {
  private readonly client: OpenAI;

  constructor(config: OpenAIProviderConfig) {
    super(config, 'openai');
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  get supportedModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateConfig(['apiKey']);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: request.systemInstruction || 'You are a helpful assistant.' },
          { role: 'user', content: request.prompt },
        ],
        temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: request.options?.maxTokens ?? this.config.maxTokens ?? 8192,
        top_p: request.options?.topP ?? 1,
        stop: request.options?.stopSequences,
      });

      const choice = response.choices[0];
      return {
        text: choice.message.content || '',
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens || 0,
          completionTokens: response.usage.completion_tokens || 0,
          totalTokens: response.usage.total_tokens || 0,
        } : undefined,
        provider: this.name,
        model: response.model,
      };
    } catch (error) {
      this.logger.error('OpenAI text generation failed', error);
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateStructured<T>(request: AIRequest, schema: Record<string, unknown>): Promise<AIStructuredResponse<T>> {
    const structuredPrompt = `Respond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nUser request:\n${request.prompt}`;

    const response = await this.generateText({
      ...request,
      prompt: structuredPrompt,
      systemInstruction: request.systemInstruction || 'You are a helpful assistant that always responds with valid JSON.',
    });

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      const data = JSON.parse(jsonMatch[0]) as T;
      return {
        data,
        text: response.text,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
      };
    } catch (error) {
      this.logger.error('Failed to parse OpenAI structured response', error);
      throw new Error(`Invalid structured response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.validateConfig(['apiKey']);

    try {
      const messages = request.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages,
        temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
        max_tokens: request.options?.maxTokens ?? this.config.maxTokens ?? 8192,
        top_p: request.options?.topP ?? 1,
        stop: request.options?.stopSequences,
      });

      const choice = response.choices[0];
      return {
        text: choice.message.content || '',
        message: {
          role: 'assistant',
          content: choice.message.content || '',
        },
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens || 0,
          completionTokens: response.usage.completion_tokens || 0,
          totalTokens: response.usage.total_tokens || 0,
        } : undefined,
        provider: this.name,
        model: response.model,
      };
    } catch (error) {
      this.logger.error('OpenAI chat failed', error);
      throw new Error(`OpenAI chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    this.validateConfig(['apiKey']);

    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: request.text,
      });

      const embedding = response.data[0]?.embedding || [];
      return {
        embedding,
        dimensions: embedding.length,
        provider: this.name,
        model: response.model,
      };
    } catch (error) {
      this.logger.error('OpenAI embedding failed', error);
      throw new Error(`OpenAI embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async countTokens(text: string): Promise<number> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: text }],
        max_tokens: 1,
      });
      return response.usage?.prompt_tokens || Math.ceil(text.length / 4);
    } catch {
      return Math.ceil(text.length / 4);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText({ prompt: 'Hello', systemInstruction: 'Respond with OK' });
      return true;
    } catch {
      return false;
    }
  }
}
