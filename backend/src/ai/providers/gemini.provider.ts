import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { BaseAIProvider } from '../interfaces/base-provider.abstract';
import { AIProviderConfig, AIRequest, AIResponse, AIChatRequest, AIChatResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIStructuredResponse } from '../interfaces/ai-provider.interface';

export interface GeminiProviderConfig extends AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class GeminiProvider extends BaseAIProvider {
  private readonly model: GenerativeModel;
  private readonly client: GoogleGenerativeAI;

  constructor(config: GeminiProviderConfig) {
    super(config, 'gemini');
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash',
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: config.maxTokens ?? 8192,
      },
    });
  }

  get supportedModels(): string[] {
    return ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateConfig(['apiKey']);

    try {
      const systemInstruction = this.buildSystemInstruction(request.systemInstruction);
      const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${request.prompt}` : request.prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return {
        text,
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          completionTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
        provider: this.name,
        model: this.model.model,
      };
    } catch (error) {
      this.logger.error('Gemini text generation failed', error);
      throw new Error(`Gemini generation failed: ${error instanceof Error ? error.message : String(error)}`);
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
      this.logger.error('Failed to parse structured response', error);
      throw new Error(`Invalid structured response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.validateConfig(['apiKey']);

    try {
      const history = request.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const lastMessage = request.messages[request.messages.length - 1];
      const chat = this.model.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      return {
        text,
        message: {
          role: 'assistant',
          content: text,
        },
        usage: response.usageMetadata ? {
          promptTokens: response.usageMetadata.promptTokenCount || 0,
          completionTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
        provider: this.name,
        model: this.model.model,
      };
    } catch (error) {
      this.logger.error('Gemini chat failed', error);
      throw new Error(`Gemini chat failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    this.validateConfig(['apiKey']);

    try {
      const embeddingModel = this.client.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await embeddingModel.embedContent(request.text);
      const embedding = (result as any).response?.embedding?.values || (result as any).embedding?.values || [];

      return {
        embedding: embedding?.values || [],
        dimensions: embedding?.values?.length || 0,
        provider: this.name,
        model: 'text-embedding-004',
      };
    } catch (error) {
      this.logger.error('Gemini embedding failed', error);
      throw new Error(`Gemini embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async countTokens(text: string): Promise<number> {
    try {
      const result = await this.model.countTokens(text);
      return result.totalTokens || Math.ceil(text.length / 4);
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
