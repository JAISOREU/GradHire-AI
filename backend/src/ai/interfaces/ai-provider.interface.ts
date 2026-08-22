export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
}

export interface AIRequest {
  prompt: string;
  systemInstruction?: string;
  options?: AIRequestOptions;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
}

export interface AIStructuredResponse<T> {
  data: T;
  text: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  messages: AIMessage[];
  options?: AIRequestOptions;
}

export interface AIChatResponse extends AIResponse {
  message: AIMessage;
}

export interface AIEmbeddingRequest {
  text: string;
}

export interface AIEmbeddingResponse {
  embedding: number[];
  dimensions: number;
  provider: string;
  model: string;
}

export interface AIProvider {
  readonly name: string;
  readonly supportedModels: string[];

  generateText(request: AIRequest): Promise<AIResponse>;
  generateStructured<T>(request: AIRequest, schema: Record<string, unknown>): Promise<AIStructuredResponse<T>>;
  chat(request: AIChatRequest): Promise<AIChatResponse>;
  embed(request: AIEmbeddingRequest): Promise<AIEmbeddingResponse>;
  countTokens(text: string): Promise<number>;
  healthCheck(): Promise<boolean>;
}
