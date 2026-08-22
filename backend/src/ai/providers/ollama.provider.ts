import { Injectable, Logger } from '@nestjs/common';
import { BaseAIProvider } from '../interfaces/base-provider.abstract';
import { AIProviderConfig, AIRequest, AIResponse, AIChatRequest, AIChatResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIStructuredResponse } from '../interfaces/ai-provider.interface';

export interface OllamaProviderConfig extends AIProviderConfig {
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class OllamaProvider extends BaseAIProvider {
  private readonly baseUrl: string;

  constructor(config: OllamaProviderConfig) {
    super(config, 'ollama');
    this.baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/$/, '');
  }

  get supportedModels(): string[] {
    return ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3'];
  }

  private async request<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      const body = {
        model: this.config.model || 'llama3.2',
        prompt: request.systemInstruction ? `${request.systemInstruction}\n\n${request.prompt}` : request.prompt,
        stream: false,
        options: {
          temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
          num_predict: request.options?.maxTokens ?? this.config.maxTokens ?? 8192,
          top_p: request.options?.topP ?? 1,
          stop: request.options?.stopSequences,
        },
      };

      const data = await this.request<any>('/api/generate', body);
      return {
        text: data.response || '',
        usage: data.eval_count || data.prompt_eval_count ? {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        } : undefined,
        provider: this.name,
        model: this.config.model || 'llama3.2',
      };
    } catch (error) {
      this.logger.error('Ollama text generation failed', error);
      throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : String(error)}`);
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
      this.logger.error('Failed to parse Ollama structured response', error);
      throw new Error(`Invalid structured response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      const messages = request.messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const data = await this.request<any>('/api/chat', {
        model: this.config.model || 'llama3.2',
        messages,
        stream: false,
        options: {
          temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
          num_predict: request.options?.maxTokens ?? this.config.maxTokens ?? 8192,
          top_p: request.options?.topP ?? 1,
          stop: request.options?.stopSequences,
        },
      });

      const assistantMessage = data.message || { role: 'assistant', content: data.response || '' };
      return {
        text: assistantMessage.content || '',
        message: {
          role: 'assistant',
          content: assistantMessage.content || '',
        },
        usage: data.eval_count || data.prompt_eval_count ? {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        } : undefined,
        provider: this.name,
        model: this.config.model || 'llama3.2',
      };
    } catch (error) {
      this.logger.error('Ollama chat failed', error);
      throw new Error(`Ollama chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    try {
      const data = await this.request<any>('/api/embeddings', {
        model: this.config.model || 'llama3.2',
        prompt: request.text,
      });

      const embedding = data.embedding || [];
      return {
        embedding,
        dimensions: embedding.length,
        provider: this.name,
        model: this.config.model || 'llama3.2',
      };
    } catch (error) {
      this.logger.error('Ollama embedding failed', error);
      throw new Error(`Ollama embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async countTokens(text: string): Promise<number> {
    try {
      const data = await this.request<any>('/api/tokenize', {
        model: this.config.model || 'llama3.2',
        prompt: text,
      });

      return data.tokens?.length || Math.ceil(text.length / 4);
    } catch {
      return Math.ceil(text.length / 4);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/api/generate', {
        model: this.config.model || 'llama3.2',
        prompt: 'Hello',
        stream: false,
      });
      return true;
    } catch {
      return false;
    }
  }
}
